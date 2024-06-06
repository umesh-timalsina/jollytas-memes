<script lang="ts">
	import OpenSeadragon from 'openseadragon';
	import { onMount } from 'svelte';
	import { Circle2 } from 'svelte-loading-spinners';
	import type { JollytasMeme } from '$lib/models';
	import memes from '$lib/memeList.json';

	let viewer: OpenSeadragon.Viewer | null = null;
	let osdContainer: HTMLElement | null = null;
	let screenSize: string;
	let isLoading: boolean = false;
	let isCursorPointer: boolean = false;
	let isInfoModalDisplayed: boolean = false;

	onMount(() => {
		const mediaQuery = window.matchMedia('(min-width: 1024px)');
		screenSize = mediaQuery.matches ? 'lg' : 'md';
		mediaQuery.addEventListener('change', (e) => {
			screenSize = e.matches ? 'lg' : 'md';
		});
	});

	function hitTest(point: OpenSeadragon.Point) {
		if (!viewer) return null;
		var pos = viewer.viewport.pointFromPixel(point);
		const count = viewer.world.getItemCount();
		for (let i = 0; i < count; i++) {
			const item = viewer.world.getItemAt(i);
			if (item) {
				const bounds = item.getBounds();
				if (bounds.containsPoint(pos)) {
					return i;
				}
			}
		}
		return null;
	}

	function resetAllOpacity() {
		if (!viewer) return;
		const count = viewer.world.getItemCount();
		for (let i = 0; i < count; i++) {
			const item = viewer.world.getItemAt(i);
			if (item) {
				item.setOpacity(0.25);
			}
		}
	}

	function makeVisible(index: number) {
		if (!viewer) return;
		const item = viewer.world.getItemAt(index);
		if (item) {
			item.setOpacity(1);
		}
	}

	function addViewerEventListeners(viewer: OpenSeadragon.Viewer | null) {
		if (!viewer) return;
		viewer.element.addEventListener('mousemove', (event) => {
			const point = new OpenSeadragon.Point(event.clientX, event.clientY);
			const hitIndex = hitTest(point);
			if (hitIndex !== null) {
				resetAllOpacity();
				isCursorPointer = true;
				makeVisible(hitIndex);
			} else {
				isCursorPointer = false;
				resetAllOpacity();
			}
		});
	}

	function showInfoModal() {
		isInfoModalDisplayed = true;
	}

	function hideInfoModal() {
		isInfoModalDisplayed = false;
	}

	$: if (osdContainer) {
		isLoading = true;
		viewer = OpenSeadragon({
			element: osdContainer,
			prefixUrl: 'https://openseadragon.github.io/openseadragon/images/',
			zoomPerScroll: 1.1,
			collectionMode: true,
			sequenceMode: false,
			preserveViewport: true,
			maxZoomLevel: 10
		});

		viewer.viewport.fitBounds(new OpenSeadragon.Rect(-4, -4, 8, 8), true);
		let allMemes = memes as JollytasMeme[];
		(async function loadMemesWithDelay() {
			for (let index = 0; index < allMemes.length; index++) {
				const meme = allMemes[index];

				viewer?.addTiledImage({
					index: index,
					tileSource: {
						type: 'image',
						url: meme.src
					},
					opacity: 0.25
				});

				// Wait for one second before loading the next image
				await new Promise((resolve) => setTimeout(resolve, 500));
				viewer.viewport.goHome();
			}
			isLoading = false;
		})();

		addViewerEventListeners(viewer);
	}
	$: isCursorPointer
		? viewer
			? (viewer.element.style.cursor = 'pointer')
			: null
		: viewer
			? (viewer.element.style.cursor = 'default')
			: null;
</script>

<!-- Only load on large and medium screens -->
{#if screenSize === 'lg'}
	<div class="w-screen h-screen bg-[#666] py-2 border-none" bind:this={osdContainer}></div>
	<div class="loader" style={!isLoading ? 'display:none' : ''}>
		<Circle2 size="300" unit="px"></Circle2>
	</div>
	<div class="info-button hover:opacity-1" title="Info" on:click={showInfoModal}>
		<img src="info.svg" alt="Info" width="50" height="50" />
	</div>
	{#if isInfoModalDisplayed}
		<div class="modal">
			<div class="cover" on:click={hideInfoModal}></div>
			<div class="content">
				<h1 class="text-4xl font-bold text-white p-2 mb-5">Jollyta's Memes</h1>
				<p class="text-xl text-white mb-5">
					Made with <a href="http://openseadragon.github.io/" target="_blank" class="text-green-200"
						>OpenSeadragon</a
					>
					and drawing inspirations from
					<a href="https://iangilman.com/openseadragon/flickr/" class="text-green-200"
						>OpenSeadragon + Flickr</a
					>
					by <a href="http://iangilman.com/" class="text-green-100" target="_blank">Ian Gilman</a>.
				</p>
				<p class="text-xl text-white">All images belong to one and only Jollyta.</p>
			</div>
		</div>
	{/if}
{:else}
	<div class="w-screen h-screen bg-gray-900 flex justify-center items-center">
		<h1 class="text-white text-2xl p-2">
			Please view this page on a computer (with larger screen)
		</h1>
	</div>
{/if}

<style>
	.loader {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
	}
	.info-button {
		position: absolute;
		right: 10px;
		top: 10px;
		width: 50px;
		height: 50px;
		opacity: 0.5;
		cursor: pointer;
	}

	.modal {
		position: fixed;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		z-index: 99999;
	}

	.cover {
		position: fixed;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		background-color: #000;
		opacity: 0.5;
	}

	.modal .content {
		position: relative;
		width: 95%;
		max-width: 600px;
		margin: 0 auto 0 auto;
		top: 30%;
		padding: 30px;
		background-color: #666;
		text-align: center;
	}
</style>
