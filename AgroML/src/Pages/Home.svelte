<script>
    import page from 'page';

    import {slide, fade, scale } from 'svelte/transition';    
    import {direction } from '../store';
       
   
        
    let fadeDelay = 2000;
    let slideDuration = 600;

    let totalPageContent = 2;
    let pageContent = 0;    
    let Y = 0;

    function checkDirection()
    {
        if(totalPageContent == 1)
        { $direction = 0; return;}

        if(pageContent < totalPageContent)
            $direction  = 1;
        else
            $direction = -1;
    }

    function nextContent(event)
    {                
        if(Math.round(Y) == (document.documentElement.scrollHeight - window.innerHeight))
        if(pageContent < totalPageContent)
            pageContent++;  
            // direction.update(n => 1);
            checkDirection();
            
    }
    function prevContent()
    {        
        pageContent--;        
        if(pageContent <= 0)
            pageContent = 1;

            // direction.update(n => -1);
            checkDirection();
    }

    function handleMousemove(event) {		
        event.preventDefault();
        if (event.deltaY > 0) 
                nextContent();
        else 
            prevContent();
        
	}

    let unlocked = true;
    function lock()
    {unlocked = false;}
    function unlock()
    {unlocked = true;}

</script>
 

<svelte:body on:wheel={handleMousemove}/>
<svelte:window bind:scrollY={Y}/>
<main>
    <h1 in:scale="{{duration:800,delay:1100, opacity:0.5, start:0}}">AI driven Agriculture</h1>
    <p in:fade="{{duration:200,delay:1800}}" on:introend={nextContent}> 
        We use state of art machine learning and deep learning technlolgies to help your yield in agriculture
    </p>
    
    {#if pageContent == 1 && unlocked }        
        <div style="text-align: left;" in:fade="{{duration:800, delay: 200}}" out:slide="{{duration:400, delay:200}}" on:outrostart={lock} on:outroend={unlock}>        
                <br><h3>Our Services</h3><br>
                <a href="/Crop">
                <div class="Panel"  in:slide="{{duration: slideDuration, delay:500}}">
                    <b>Crop Prediction</b>
                    <p>
                        Recomendation about the type of crops to be cultivated which is best suited for the respective conditions
                    </p>                
                </div>
                </a>
                <a href="/CropYield">
                <div class="Panel" in:slide="{{duration: slideDuration, delay:600 }}">
                    <b>Crop Yield</b>
                    <p>
                        Analysis based on previous datasets for maximizing crop yield
                    </p>
                </div>
                </a>
                <a href="/PlantDisease">
                    <div class="Panel" in:slide="{{duration: slideDuration, delay:700}}">
                        <b>Plant Disease</b>
                        <p>
                            Predicting the name and cause of crop disease and suggestions to cure it
                        </p>
                    </div>        
                </a>
        </div>
    {/if}    

    
    {#if pageContent == 2 & unlocked} 
        <div style="text-align: left;" in:fade="{{duration:800, delay: 700}}" out:slide="{{duration:400, delay:20}}" on:outrostart={lock} on:outroend={unlock}>        
            <br><h3>Contributors</h3>
            <div class="List"  in:slide="{{duration: slideDuration, delay:750}}">
                Rishi Patel
            </div>
            <div class="List" in:slide="{{duration: slideDuration, delay:750 }}" >
                Rohan Brahmbhatt
            </div>
            <div class="List" in:slide="{{duration: slideDuration, delay:750}}" >
                Varun Khambhata
            </div>        
            <div class="List" in:slide="{{duration: slideDuration, delay:750}}" >
                Piyush Bagani
            </div>        
        </div>
    {/if}
            
    
</main>

<style>
    main
    {
        /* border: 3px solid #42f5b9;	 */
        width: 100%;
    }

    a
    {
        color:inherit
    }


    .Panel
    {
        backdrop-filter: blur(8px) contrast(2) saturate(-1.1) ;
		background-color: rgba(255, 255, 255, 0.219);	
		box-shadow: 0px 0px 2px grey;			
        width:300px;
        height:300px;
        /* display: flex; */
        /* float:left; */
        display: inline-block;
        vertical-align: top;
        border-radius: 15px;
        /* margin-top: 20px; */
        padding: 12px;
        /* padding-right: 30px; */
        margin-right: 5%;        
        margin-left: 0%;     
        transition: all 0.5s;
    }


    .Panel:hover
    {
        backdrop-filter: blur(10px) contrast(1.8) saturate(1.5);
        background-color: rgba(255, 255, 255, 0.548);	
		/* background-color: rgba(200, 200, 200, 0.9); */
		box-shadow: 0px 0px 10px black;	
		transition: 0.9s;
        /* width: 305px; */
        /* height: 305px; */
        /* transition: width 0.3s; */
        /* transition: height 0.3s; */
    }

    .List
    {
        backdrop-filter: blur(8px) contrast(2) saturate(-1.1) ;
		background-color: rgba(255, 255, 255, 0.219);	
		box-shadow: 0px 0px 2px grey;			
        width:90%;
        /* height:40px; */
        /* display: flex; */
        /* float:left; */
        /* display: inline-block; */
        /* vertical-align: bottom; */
        border-radius: 15px;
        margin-top: 10px;
        padding: 10px;    
        transition: all 0.5s;
    }

    .List:hover
    {
        backdrop-filter: blur(10px) contrast(1.8) saturate(1.5);
        background-color: rgba(255, 255, 255, 0.548);	
		/* background-color: rgba(200, 200, 200, 0.9); */
		box-shadow: 0px 0px 10px black;	
		transition: 0.9s;		           
        transition: all 0.5s;
    }

    

</style>