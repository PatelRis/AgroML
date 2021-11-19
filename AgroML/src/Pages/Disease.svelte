<script>
import { bind } from 'svelte/internal';

    import {slide, fade, scale } from 'svelte/transition';
    import {direction} from '../store';

    $direction = 0;    
    let showOUT = false;
    let files;
    let DropedFiles;
    let plntNM_Cond;
    let DISname;
    let DISdesc;
    let DISps;
    let DISimgURL;    
    let linePos = 0;    
    let Scanning = false;
    let dir = 0;
    let totalPageContent = 2;
    let pageContent = 1;    
    let Y = 0;
    let unlockSecondPage = false;
    let imgSRC;
    let isdropped = false;

   function dragOverHandler(event)
   {
        event.preventDefault();
        // alert("drag over");
   }

   //by dropping
   function dropHandler(event)
   {
        event.preventDefault();
        
        if (event.dataTransfer.items) 
        {
            // If dropped items aren't files, reject them
            if (event.dataTransfer.items[0].kind === 'file') 
            {
                let file = event.dataTransfer.items[0].getAsFile();                                                
                let extn = file.name.split('.')[1];                
                //allow only jpg or png files
                if(extn == "jpg" || extn == "png" || extn == "jfif" || extn == "v1" || extn == "JPG") 
                {                    
                    imgSRC = URL.createObjectURL(file);     
                    DropedFiles = file;                             
                    document.getElementById('OGfileINP').value = '';       
                    isdropped = true;                             
                }
            }
        } 
   }

   //by selection
   $: {
        if (files && files[0]) 
        {imgSRC =  URL.createObjectURL(files[0])}
    }

   function showScanLine()
   {
        if(linePos == 0)
            linePos = 100;
        else    
            linePos = 0;

        // if(linePos >= 100)
        //     dir = 1;
        // if(linePos <= 0)
        //     dir = 0;
        // if(dir == 0)
        //     linePos += 2;
        // else
        //     linePos -= 2;

        
   }

    async function fetchPrediction() 
    {                                        
        let fd = new FormData();
        // fd.append('title', 'Sample Title');        
        // fd.append('PLANTimage', imgUPfile);     
        if(document.getElementById('OGfileINP').value == '' )              
            fd.append('PLANTimage', DropedFiles);
        else
        {
            fd.append('PLANTimage', files[0]);                
            DropedFiles = null;
        }

        let ModelResponse = await fetch('/TriggerNeuralNet',{method: "POST", body:fd});
        if (!ModelResponse.ok)
            throw new Error();
        return await ModelResponse.json();

        
    }

    async function CheckForDisease()
    {        
        if(DropedFiles == null && files[0] == null)
            return;
        
        Scanning = true;
        // showScanLine();
        var ScanThread = setInterval(showScanLine, 1600);        

        fetchPrediction()
            .then(
                res =>
                {
                    DISname   = res["Name"];
                    DISdesc   = res["Desc"];
                    DISps     = res["Possible Steps"];
                    DISimgURL = res["img"];
                    showOUT = true;
                    plntNM_Cond = DISname.split(" : ");
                    Scanning = false;    
                    clearInterval(ScanThread);
                    linePos = 0;            
                    unlockSecondPage = true;                       
                    checkDirection();
                }
            )
            .catch(
                err=>
                {
                     // ERROR - response from server not received
                }
            );  
        
             
    }
  
    
    function BTNbindclick()
    {        
        document.getElementById('OGfileINP').click();        
        isdropped = true;
    }
    

    function nextContent(event)
    {                
        if(!unlockSecondPage) return;  
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
    

    function checkDirection()
    {
        if(totalPageContent == 1)
        { $direction = 0; return;}

        if(pageContent < totalPageContent)
            $direction  = 1;
        else
            $direction = -1;
    }

   
</script>


<svelte:body on:wheel={handleMousemove}/>
<svelte:window bind:scrollY={Y}/>
<main>    
    <h1 transition:scale="{{duration:800,delay:50, opacity:0.5, start:0}}">Plant Disease Detection</h1>    
    <input type="file" id="OGfileINP" bind:files style="display: none;">
    {#if pageContent == 1  }
        <div in:fade="{{duration:200,delay:200}}" style="text-align: left; width: 30%; float:left; " >   
            <div>
                <button class="inp" transition:scale="{{delay:200, duration: 400, start: 0}}" on:click={CheckForDisease}>
                    Check for disease
                </button>             
            </div>           
            {#if showOUT}
                <div class="modelWindow" transition:slide="{{delay:200}}">
                    <h2> Plant:     {plntNM_Cond[0]} </h2>
                    <h2> Condition: {plntNM_Cond[1]} </h2>
                    Scroll down to know more
                </div>
            {/if}
        </div>


        <div in:fade="{{duration:200,delay:0}}" style="text-align: left; width: 65%; float:left; margin-left: 10px; " >        
            <label for="file-input">
                <div class="imageWindow" on:drop={dropHandler} on:dragover={dragOverHandler} in:slide="{{delay:200}}" out:slide on:click={BTNbindclick}>    
                    {#if Scanning}  
                        <div id="ScanLine" style="top:{linePos}%;"></div>
                    {/if}
                    {#if isdropped == false}
                        Drag and drop image here    <br><br>
                                Or          <br>    <br>    
                        Click here to load image         
                        <br><br>           
                    {/if}
                    <img id="upIMG" src={imgSRC} alt="">	                    
                </div>
                
            </label>                       
        </div>
    {/if}

    {#if pageContent == 2}   
        <div class="modelWindow" in:scale="{{delay:800}}" out:scale style="width: 30%;; height: 420px; float:left; padding:0; overflow: hidden;">
            <img src={DISimgURL} alt="[Image not avaliable]" style="min-height: 100%; min-width: 100%; ">            
        </div>
  
        <div  style="float:left; width:60%; margin-left:10px;">
            <div class="modelWindow customMW" in:scale="{{delay:850}}" out:scale>
                <h2> {DISname} </h2>
            </div>
            <div class="modelWindow customMW" in:scale="{{delay:900}}" out:scale>
                <h2>Description</h2>
                <p> {DISdesc} </p>
            </div>
            <div class="modelWindow customMW" in:scale="{{delay:950}}" out:scale>
                <h2>Prevention Steps</h2>
                <p> {DISps} </p>
            </div>
        </div>
    {/if}

</main>
    

   
    
  



<style>

    main
    {        
        width: 100%;
        height: 100%;
    }
    

    
    p
    {
        font: inherit;
        color: inherit;
        word-wrap: break-word;
        white-space:pre-wrap;
    }

    .imageWindow
    {
        /* display:flex; */
        position: absolute;
        margin-left: 5%;                              
        height: 60%;
        width: 32%;
        /* vertical-align: top; */
        text-align: center;
        border-radius: 15px;
        padding:0;
        backdrop-filter: blur(8px) contrast(2) saturate(-1.1) ;
		background-color: rgba(255, 255, 255, 0.219);	
        box-shadow: 0px 0px 2px grey;	
        overflow: hidden;
        transition: 0.9s;
    }

    #upIMG
    {        
        position: relative;
        /* left: -15%; alter this to move left or right         */
        /* top: -25%; alter this to move up or down */
        /* max-width: max-content;       */
        height:100%;
        /* max-height: 10%;      */
    }

    .customMW
    {
        margin-bottom: 12px;
    }
    .modelWindow
    {
        /* display:flex; */
		/* position: relative; */
        /* right:50px; */
        /* top:0%; */
        /* margin-left: -5%; */
        width: 94%;                        
        height:100%;
        backdrop-filter: blur(8px) contrast(2) saturate(-1.1) ;
		background-color: rgba(255, 255, 255, 0.219);	
        box-shadow: 0px 0px 2px grey;	    
        /* display: inline-block; */
        vertical-align: top;
        border-radius: 15px;
        padding: 12px;
   
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


    #ScanLine
    {
        background-color: rgb(2, 75, 51);
        height: 4px;
        box-shadow: 0px 0px 50px rgb(129, 255, 71);
        width: 100%;
        position: absolute;        
        transition: 1.6s;
        z-index: 10;
    }
</style>