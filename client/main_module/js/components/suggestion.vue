<template>
	<div>
		<img class="picture" :src="suggestion.picture" />
		<span class="timestamp">{{new Date(suggestion.timestamp).toString()}}</span>
	</div>
</template>

<script type="text/javascript">
	(function () {
		"use strict";
		module.exports = {
			"name": "app",
			"props": ["suggestion"],
			"data": function () {
				return {}
			},
			"components": {},
			"methods": {}
		};
	}());
</script>
<style scoped>
	.suggestion {
		background-color: white;
		 width: 90%;
		border: 1px solid gainsboro;
		margin: 10px;
		box-sizing: border-box;
		display: flex;
		max-width: 100%;
		flex-direction: column;
		/* width: 100%; */
		justify-content: space-between;
		overflow: hidden;
		border-radius: 3px;
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

	@media screen and (min-width: 760px) {
		.suggestion {
			width: 45%;
			height: auto;
			flex-wrap: wrap;
		}
	}
</style>