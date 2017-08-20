<template>
	<div id="app-header">
		header
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
		min-height: 60px;
		width: 100%;
		border-bottom: 1px solid gainsboro;
		box-shadow: 0 1px 5px 2px lightblue;
		z-index: 2;
		display: flex;
		align-items: center;
	}

	#app-header img {
		height: 35px;
		width: auto;
	}
</style>