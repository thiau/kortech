<template>
	<div id="app-header">
		<img src="../main_module/assets/art.png" />
		<span>Kortech</span>
	</div>
</template>

<script type="text/javascript">
	(function () {
		"use strict";
		module.exports = {
			"name": "header-app",
			"data": function () {
				return {
				}
			},
			"components": {},
			"methods": {
			}
		};
	}());
</script>

<style scoped>
	#app-header {
		background-color: rgba(0, 0, 0, 0.9);
		min-height: 70px;
		width: 100%;
		border-bottom: 1px solid rgb(210, 210, 210);
		box-shadow: 0 1px 3px 4px rgba(255,255,255, 1);
		z-index: 2;
		display: flex;
		align-items: center;
	}

	#app-header img {
		height: 35px;
		width: 35px;
	}

	span {

	}

</style>