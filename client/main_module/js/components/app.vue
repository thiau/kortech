<template>
	<div id="app">
		<header-app></header-app>
		<div id="content">
			<div @click="toggleListen">
				{{isListening ? "Listening" : "Click to listen"}}
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
					"annyang": require("annyang")
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
						this.annyang.setLanguage("pt-BR");
						this.annyang.start();
						this.annyang.addCallback("error", function(error) {
							reject(error);
						});
						this.annyang.addCallback("result", (userSaid) => {
							if (Array.isArray(userSaid)) {
								userSaid = userSaid[0];
							}
							factory.askWatson(userSaid).then((watsonResponse) => {
								resolve(watsonResponse);
							}).catch((err) => {
								reject(err);
							}).then(() => {
								this.stopListening();
							});
						});
					});
				},
				"stopListening": function () {
					if (this.annyang.isListening()) {
						this.changeListeningStatus();
						this.annyang.removeCallback("result", () => {
							this.annyang.stop();
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

	#app > * {
		box-sizing: inherit;
	}

</style>