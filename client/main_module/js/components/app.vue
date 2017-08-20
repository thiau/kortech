<template>
	<div id="app">
		<header-app></header-app>
		<div id="content">
			<div @click="toggleListen">
				{{isListening ? "Listening" : "Click to listen"}}
			</div>
			<div v-for="result in this.results" class="suggestion">
				<div>
					<img :src="result.picture" />
				</div>
				<div class="image-id">
					<div>
						ID
					</div>
					<div>
						{{result._id}}
					</div>
				</div>
				<div class="timestamp">
					<div>
						Timestamp
					</div>
					<div>
						{{result.timestamp}}
					</div>
				</div>
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

				"toggleListen": function () {
					if (this.isListening) {
						this.stopListening();
					} else {
						this.startListening();
					}
				},
				"getImage": function (id) {
					factory.getImage(doc._id).then((image) => {
						doc.picture = 'data:image/jpg;base64,' + image;
						this.results.push(doc);
					});
				},
				"startListening": function (debug) {
					return new Promise((resolve, reject) => {
						this.isListening = true;
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
										doc.picture = 'data:image/jpg;base64,' + image;
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
						this.isListening = false;
						console.log(this.annyang);
						this.annyang.pause();
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

	.suggestion img {
		width: 50px;
		height: 50px;
		display: block;
	}

</style>