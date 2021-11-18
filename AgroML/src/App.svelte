<script>	
	import {fly, fade} from 'svelte/transition';
	import router from 'page';
	import Home from './Pages/Home.svelte';
	import Crop from './Pages/Crop.svelte';
	import Disease from './Pages/Disease.svelte';
	import CropYield from './Pages/CropYield.svelte';


	import {direction} from './store';
	import { bind, element } from 'svelte/internal';

	let load = false;
	
	function start()
	{load=true;}
	setInterval(start);

	
	let page, switched = false;
	function switchPage()
	{switched=true; }
	router('/', () => {page = Home; switched = false; setTimeout(switchPage, 1000);});
	router('/Crop', () => {page = Crop; switched = false; setTimeout(switchPage, 1000);});
	router('/PlantDisease',() =>{page = Disease; switched = false; setTimeout(switchPage, 1000);});
	router('/CropYield',() =>{page = CropYield; switched = false; setTimeout(switchPage, 1000);});
	router.start();

	
</script>

<div id="backdrop" style="background-image: url('Dark Gradient 04.png');" >	</div>

<div id="main">
	
		{#if load}
			<div id="Title" in:fly="{{ y: -500, duration: 800 }}">
				<a href="/">
					<button class="TitleButton" in:fly="{{x:-500, duration: 1200, delay:600}}">
						AgroML
					</button>
				</a>
				<div id="Pages" in:fade="{{duration: 1000, delay:1000}}">
					<a href="/Crop">				
						<button class="TitleButton">
							Crop prediction
						</button>
					</a>
					<a href="/CropYield">				
						<button class="TitleButton" >
							Crop Yield
						</button>
					</a>
					<a href="/PlantDisease">				
						<button class="TitleButton">
							Plant Disease
						</button>
					</a>
				</div>		
			</div>
		{/if}

		{#if switched}
			<div id="Content">
				<svelte:component this={page}/>							
			</div>
		{/if}

		{#if $direction == -1}
			<div class="Arrow" style="top:200px; background-image: url('up.png');" transition:fade="{{duration:800, delay: 100}}">
			</div>
		{:else if $direction == 1}		
			<div class="Arrow" style="bottom:100px; background-image: url('down.png');" transition:fade="{{duration:800, delay: 100}}">
			</div>
		{/if}		
</div>



<style>	
	#backdrop
	{
		z-index: -1;
		width: 100%;
		height:100%;
		position: fixed;
		top: 0;
		left: 0;	
		background-size: 100% 100%;
		background-repeat: no-repeat;
		background-attachment: fixed;
		background-position: top left;
	}
	#main
	{		
		
		/* background: linear-gradient(315deg, rgba(255, 0, 247, 0.52) 0%, rgba(44, 98, 186, 0.82) 100%); */
		/* background: linear-gradient(315deg, rgba(4, 59, 16, 0.973) 0%, rgba(147, 216, 56, 0.82) 100%); */
		/* background: radial-gradient(at bottom right,green 70%, black); */						
		height: 100% ;		
		margin: -8px;		
		padding-bottom: 16px;			
		/* margin-top: -20px;	 */
		/* margin-right: -8px; */
		/* margin-left: -8px;;		 */
		color: whitesmoke;		
		font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;	
		

	}

	#Title
	{
		display: flex;		
		padding-top: 18px;	
		padding-bottom: 5px;
		padding-left: 50px;			
	}

	#Pages
	{
		display: flex;
		justify-content: flex-end;		
		width: 100%;
	}
	
	.TitleButton
	{
		margin-left: 8px;
		margin-right: 20px;
		background:rgba(240, 240, 240, 0);
		border: 0;
		font-size: large;
		font-weight: 650;
		/* font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; */
		border-radius: 20px;		
		transition: 0.8s;
		color: whitesmoke;
	}

	.TitleButton:hover
	{		
		/* backdrop-filter: blur(3px) contrast(1.6) saturate(1.1);
		background-color: rgba(255, 255, 255, 0.219);	 */
		backdrop-filter: blur(3px) contrast(1.2) saturate(2.5);
		background-color: rgba(255, 255, 255, 0.062);	
		box-shadow: 0px 0px 2px grey;			
	}

	.TitleButton:active
	{
		/* backdrop-filter: blur(0px) contrast(2.6) saturate(5.1);
		background-color: rgba(255, 255, 255, 0.219); */
		backdrop-filter: blur(0px) contrast(-1) saturate(5.1);
		background-color: rgba(255, 255, 255, 0.219);
		box-shadow: 0px 0px 10px black;	
		transition: 0.2s
	}	


	#Content
	{
		display: flex;		
		width: 90%;
  		margin: auto;
		margin-top:80px;
  		/* border: 3px solid #4287f5;		 */
	}

	.Arrow
	{		
		width: 40px;
		height: 80px;
		display:flex;
		position: fixed;		
		right: 50px;
		background-size: 100% 100%;
		background-repeat: no-repeat;
		opacity: 70%;
	}



	
</style>