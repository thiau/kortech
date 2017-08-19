<template>
	<div id="app">
		<header-app></header-app>
		<div id="content">
			oi
		</div>
	</div>
</template>

<script type="text/javascript">
	(function () {
		"use strict";
		module.exports = {
			"name": "app",
			"data": function () {
				return {}
			},
			"components": {
				"headerApp": require("./header.vue")
			},
			"methods": {
				"start": function (debug) {
					return new Promise(function (resolve, reject) {
						const annyang = require("annyang");
						if (!debug) {
							annyang.debug();
						}

						annyang.start();
						annyang.addCallback("result", function(userSaid, commandText, phrases) {
							if (Array.isArray(userSaid)) {
								userSaid = userSaid[0];
							}
//							props.messageBox.show(userSaid);
							factory.askWatson(userSaid).then(function (watsonResponse) {
								console.log(watsonResponse);
								resolve(watsonResponse);
							}).then(function () {
								annyang.removeCallback("result");
								annyang.abort();
//								window.setTimeout(props.messageBox.hide, 2000);
							});
							console.log(userSaid); // sample output: 'hello'
						});
					});
				},
				"stop": function () {
					if (annyang.isListening()) {
						annyang.removeCallback("result");
						annyang.abort();
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