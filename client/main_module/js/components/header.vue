<template>
	<div id="app-header">
		<a href="/">
			<img src="../main_module/assets/art.png" />
			<span>Kortech</span>
		</a>
		<div class="user-id">
			<span>Olá, Bruno!</span>
		</div>
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
		justify-content: space-between;
	}

	#app-header img {
		height: 35px;
		width: 35px;
		margin-left: 5px;
	}

	span {
		color: rgba(182, 193, 241, 0.65);
		font-size: 36px;
		margin-left: 5px;
	}

	a {
		text-decoration: none;
		display: flex;
		align-items: center;
	}

	.user-id > span {
		color: white;
		font-size: 14px;
		margin: 0 10px;
	}

</style>