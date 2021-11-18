<script>
    import {slide, fade, scale } from 'svelte/transition';
    import {direction } from '../store';

    $direction = 0;

    let INPUT = {N:null, P:null, K:null, pH:null, Rfall:null, Temp:null, Hum:null};
    let dsp = "block";
    let currClass = "inp"
    let runML = false;
    let prediction = "";
    let predictionDesc = "";
    let incomplete = false, invalid = false;

    async function fetchPrediction() 
    {        
        let ModelResponse = await fetch('/TriggerModel',{method: "POST", body:JSON.stringify(INPUT), headers: new Headers({"content-type": "application/json"})});
        if (!ModelResponse.ok)
            throw new Error();
        return await ModelResponse.json();
    }

    async function Find()
    {       
        invalid = false;  
        for(let K in INPUT)
        {
            if(INPUT[K] < 0)
            {
                invalid = true;
                return;
            }
            
            if(INPUT[K] == null)
            {                
                incomplete = true;
                return;
            }
            
        }
        incomplete = false;
        
        fetchPrediction()
            .then(
                res =>
                {
                    prediction = res["result"];            
                    predictionDesc = res["desc"];
                    currClass = "cmptINP";
                    runML = true;
                }
            )
            .catch(
                err=>
                {
                    // ERROR - response from server not received
                }
            );

        // fetch('/TriggerModel',{method: "POST", body:JSON.stringify(INPUT), headers: new Headers({"content-type": "application/json"})})
        // .then(function (response) 
        //     {
        //         return response.text();
        //     })
        // .then(function (text) 
        //     {
        //         prediction = text;
        //     });

      

        
    /*
        const Http = new XMLHttpRequest();
        const url='https://jsonplaceholder.typicode.com/posts';
        // Http.open("GET", url);
        Http.open('POST', url);
        Http.send();
        Http.onreadystatechange = function()
        {
            if(this.readyState == 4 && this.status == 200)
                alert(Http.responseText);
        }
    */

        

        
    }

    function Open()
    {
        currClass="inp";
        runML = false;
    }
    
</script>


<!-- <title>asdas</title> -->

<main>        
    <h1 transition:scale="{{duration:800,delay:50, opacity:0.5, start:0}}">Crop Prediction</h1>
        <div in:fade="{{duration:200,delay:0}}" style="text-align: left; width: 30%; float:left">        
            <input type="number" class="{currClass}" bind:value={INPUT['N']} transition:scale="{{delay:200, duration: 400, start: 0}}" on:focus="{Open}" placeholder="Nitrogen"> <br>
            <input type="number" class="{currClass}" bind:value={INPUT['P']} transition:scale="{{delay:250, duration: 400, start: 0}}" on:focus="{Open}" placeholder="Phosphorus"> <br>
            <input type="number" class="{currClass}" bind:value={INPUT['K']} transition:scale="{{delay:300, duration: 400, start: 0}}" on:focus="{Open}" placeholder="Potasium"> <br>
            <input type="text" class="{currClass}" bind:value={INPUT['Temp']} transition:scale="{{delay:330, duration: 400, start: 0}}" on:focus="{Open}" placeholder="Temperature"> <br>
            <input type="text" class="{currClass}" bind:value={INPUT['Hum']} transition:scale="{{delay:390, duration: 400, start: 0}}" on:focus="{Open}" placeholder="Humidity"> <br>
            <input type="number" class="{currClass}" bind:value={INPUT['pH']} transition:scale="{{delay:420, duration: 400, start: 0}}"on:focus="{Open}" placeholder="pH level"> <br>
            <input type="number" class="{currClass}" bind:value={INPUT['Rfall']}  transition:scale="{{delay:450, duration: 400, start: 0}}" on:focus="{Open}" placeholder="Rainfall (in mm)"> <br>        
            {#if currClass =="inp"}
                <button class="inp" transition:scale="{{delay:460, duration: 400, start: 0}}" on:click={Find}>
                    Find
                </button>        
            {/if}
            {#if incomplete}
                <div transition:scale="{{duration:200, start:0, opacity:0.1}}" style="color: red;padding-left: 20px;">Enter all details </div>
            {/if}
            {#if invalid}
            <div transition:scale="{{duration:200, start:0, opacity:0.1}}" style="color: red;padding-left: 20px;">Entered values are invalid </div>
            {/if}
        </div>    
    
        {#if runML}
        <div class="modelWindow" transition:slide>
            <h2> {prediction} is recommended</h2>
            <p>
                {predictionDesc}
            </p>
        </div>
        {/if}

</main>


<style>

    main
    {        
        width: 100%;
    }

    h2
    {
        text-transform: capitalize;
        text-align: center;
    }
    
    p
    {
        font: inherit;
        color: inherit;
        word-wrap: break-word;
        white-space:pre-wrap;
    }
    .modelWindow
    {
        display:flex;
		position: absolute;
        /* right:50px; */
        /* top:0%; */
        margin-left: -5%;
        width: 60%;
        height:50%;
        backdrop-filter: blur(8px) contrast(2) saturate(-1.1) ;
		background-color: rgba(255, 255, 255, 0.219);	
        box-shadow: 0px 0px 2px grey;	    
        display: inline-block;
        vertical-align: top;
        border-radius: 15px;
        padding-left: 12px;
        padding-right: 12px;
        transition: 0.9s;
    }

    .modelWindow:hover
    {
        backdrop-filter: blur(14px) contrast(3.5) saturate(1.1);
        background-color: rgba(255, 255, 255, 0.219);	
		/* background-color: rgba(200, 200, 200, 0.9); */
		box-shadow: 0px 0px 10px black;	
		transition: 1.2s;
        /* width: 305px; */
        /* height: 305px; */
        /* transition: width 0.3s; */
        /* transition: height 0.3s; */
    }
   
    .cmptINP
    {
        border-radius: 60px;
        backdrop-filter: blur(8px) contrast(2) saturate(-1.1) ;
		background-color: rgba(255, 255, 255, 0.219);	
        width: 50px;        
        outline: none;
        padding-left: 4px;
        color: lightgray;
        transition: 0.5s;            
        margin-bottom: 30px;    
        text-align: center;      
    }
    .cmptINP::-webkit-inner-spin-button
    {
        appearance: none;
    }
    
    .inp {
        
        border-radius: 60px;
        backdrop-filter: blur(8px) contrast(2) saturate(-1.1) ;
		background-color: rgba(255, 255, 255, 0.219);	
        width: 100%;        
        outline: none;
        padding-left: 20px;
        color: lightgray;        
        transition:0.5s;
      }

    .inp::-webkit-inner-spin-button
    {
        appearance: none;
    }


    button
    {
        text-align: left;        
        backdrop-filter: blur(4px) contrast(1) saturate(2.5);
        background-color: rgba(200, 200, 200, 0.103);
        transition:0.8s;
    }

    button:hover
    {
        backdrop-filter: blur(8px) contrast(1.3) saturate(2);
        background-color: rgba(0, 180, 45, 0.103);
        padding-left: 50px;
        transition: 0.8s;
    }

    button:active
    {
        backdrop-filter: blur(10px) contrast(0.5) saturate(1);
        background-color: rgba(0, 180, 45, 0.103);
        padding-left: 40px;
        transition: 0.2s;
        box-shadow: 0px 0px 10px black;	
    }


</style>