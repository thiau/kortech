<template>
	<div id="app">
		<header-app></header-app>
		<div id="content">
			<div @click="toggleListen" id="listen" v-bind:class="{ 'animated pulse': isListening }">
				<img v-if="!isListening" src="/assets/sound.svg" class="recording-icon"/>
				<div v-if="isListening" class="recording-icon-active"></div>
				<span>{{isListening ? "Listening" : "Click to listen"}}</span>
			</div>
			<transition-group
				name="custom-classes-transition"
				enter-active-class="animated fadeIn">
				<suggestion-item v-for="result in this.results" class="suggestion" :key="result._id" :suggestion="result">
				</suggestion-item>
			</transition-group>
			<div v-if="results.length <= 0 && initial === 0 && !isLoading" id="no-results">
				<img src="/assets/fail.svg" />
				<span>No results found</span>
			</div>
			<div v-if="results.length <= 0 && initial === 1 && !isLoading" id="no-results">
				<img src="/assets/start.svg" />
				<span>Start querying pressing the button below</span>
			</div>
			<template v-if="this.isLoading">
				<div id="loading-container">
					<loading id="load">
					</loading>
				</div>
			</template>
		</div>

		<transition name="toast"
					enter-active-class="animated slideInUp"
					leave-active-class="animated slideOutDown">
			<template v-if="userInput">
				<div id="toast">
					Text recognized: {{userInput}}
				</div>
			</template>
		</transition>

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
					"results": [],
					"isLoading": false,
					"initial": 1,
					"userInput": ""
				}
			},
			"components": {
				"headerApp": require("./header.vue"),
				"loading": require("./load.vue"),
				"suggestionItem": require("./suggestion.vue")
			},
			"methods": {
				"startLoading": function () {
					this.isLoading = true;
				},
				"stopLoading": function () {
					this.isLoading = false;
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
						this.userInput = "";
						this.isListening = true;
						if (!debug) {
							this.annyang.debug();
						}

						if (!this.annyang.isListening()) {
							this.annyang.setLanguage("pt-BR");
							this.annyang.start();
						}

						this.annyang.removeCallback();
						this.annyang.addCallback("error", (error) => {
							this.stopListening();
							reject(error);
						});
						this.annyang.addCallback("result", (userSaid) => {
							this.startLoading();
							this.results = [];
							if (Array.isArray(userSaid)) {
								userSaid = userSaid[0];
								this.userInput = userSaid;
							}
							factory.askWatson(userSaid).then((watsonResponse) => {
								this.initial = 0;
								let count = watsonResponse.docs.length;
								if (count > 0) {
									watsonResponse.docs.forEach((doc) => {
										factory.getImage(doc._id).then((image) => {
											doc.picture = "data:image/jpg;base64," + image;
											this.results.push(doc);
											count -= 1;
											if (count <= 0) {
												this.stopLoading();
											}
										});
									});
								} else {
									this.stopLoading();
								}

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
		overflow-y: auto;
		max-height: 100%;
		width: 100%;
		height: 100%;
		background-color: azure;
	}


	#app > * {
		box-sizing: inherit;
	}

	#listen {
		background: white;
		border: 1px solid gainsboro;
		margin: 20px;
		padding: 10px;
		box-sizing: border-box;
		border-radius: 5px;
		letter-spacing: 1px;
		cursor: pointer;
		display: flex;
		justify-content: flex-start;
		align-items: center;
	}

	#listen.animated {
		box-shadow: 0 1px 2px rgba(14, 113, 150, 0.55);
	}


	#loading-container {
		width: 100%;
		height: 30%;
		display: flex;
		justify-content: center;
		align-content: center;
		align-items: center;
	}

	#load {
		width: 120px !important;
		height: 120px !important;
	}

	.suggestion {
		background-color: white;
		/* width: 50%; */
		border: 1px solid gainsboro;
		margin: 10px;
		box-sizing: border-box;
		display: flex;
		max-width: 100%;
		flex-direction: column;
		/* width: 100%; */
		height: 250px;
		justify-content: space-between;
		overflow: hidden;
	}

	.suggestion img {
		width: 100%;
		flex: 1;
		height: 90%;
		display: block;
		max-height: 100%;
	}

	.suggestion .timestamp {
		color: gray;
		font-size: 8px;
		letter-spacing: 1px;
		align-self: flex-end;
		margin: 5px;
	}


	.recording-icon {
		width: 35px;
		height: 35px;
	}

	.recording-icon-active {
		width: 18px;
		height: 18px;
		background-color: orangered;
		border-radius: 50%;
		margin: 5px;
	}


	#no-results {
		height: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 20px;
		user-select: none;
		cursor: default;
		flex-direction: column;
	}

	#no-results img {
		max-height: 100%;
		max-width: 100%;
		height: 200px;
	}

	#toast {
		background-color: rgba(0, 0, 0, 0.9);
		color: white;
		min-height: 60px;
		display: flex;
		justify-content: left;
		align-items: center;
		padding: 10px;
	}


</style>