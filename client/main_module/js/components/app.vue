<template>
	<div id="app">
		<header-app></header-app>
		<div id="content">
			<div @click="toggleListen">
				{{isListening ? "Listening" : "Click to listen"}}
			</div>
			<div v-for="result in this.results" class="suggestion">
				<div class="image-id">
					<h6>
						ID
					</h6>
					<span>
						{{result._id}}
					</span>
				</div>
				<div class="timestamp">
					<h6>
						Timestamp
					</h6>
					<span>
						{{result.timestamp}}
					</span>
				</div>
				<img :src="result.image" />
			</div>
		</div>
	</div>
</template>

<script type="text/javascript">
	(function () {
		"use strict";
		const factory = require("../factory/factory");
		module.exports = {
			"name": "app",
			"data": function () {
				return {
					"isListening": false,
					"annyang": require("annyang"),
					"results": []
				}
			},
			"components": {
				"headerApp": require("./header.vue")
			},
			"methods": {
				"changeListeningStatus": function () {
					this.isListening = !this.isListening;
				},
				"toggleListen": function () {
					if (this.isListening) {
						this.stopListening();
					} else {
						this.startListening();
					}
				},
				"startListening": function (debug) {
					return new Promise((resolve, reject) => {
						this.changeListeningStatus();
						if (!debug) {
							this.annyang.debug();
						}

						if (!this.annyang.isListening()) {
							this.annyang.setLanguage("pt-BR");
							this.annyang.start();
						}

						this.annyang.addCallback("error", function(error) {
							reject(error);
						});
						this.annyang.addCallback("result", (userSaid) => {
							this.results = [];
							if (Array.isArray(userSaid)) {
								userSaid = userSaid[0];
							}
							factory.askWatson(userSaid).then((watsonResponse) => {
								watsonResponse.docs.forEach((doc) => {
									factory.getImage(doc._id).then((image) => {
										doc.picture = 'data:image/png;base64,' + image;
										this.results.push(doc);
									});
								})
							}).catch((err) => {
								reject(err);
							});
							this.stopListening();
						});
					});
				},
				"stopListening": function () {
					if (this.annyang.isListening()) {
						this.changeListeningStatus();
						console.log(this.annyang);
						this.annyang.removeCallback("result", () => {
							this.annyang.abort();
						});
					}
				}
			}
		};
	}());
</script>
<style scoped>
	#app {
		width: 100%;
		height:100%;
		margin: 0;
		padding: 0;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
	}

	#content {
		overflow-y: scroll;
		max-height: 100%;
		width: 100%;
		height: 100%;
		background-color: azure;
	}

	#app > * {
		box-sizing: inherit;
	}

	.suggestion {
		background-color: white;
		/* width: 50%; */
		border: 1px solid gainsboro;
		padding: 20px;
		margin: 10px;
		box-sizing: border-box;
		display: flex;
		max-width: 100%;
		flex-direction: column;
		/* width: 100%; */
		height: 250px;
		justify-content: center;
		align-items: center;
	}

</style>