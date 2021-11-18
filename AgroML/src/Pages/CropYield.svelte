<script>
    import page from 'page';
    import {slide, fade, scale } from 'svelte/transition';
    import {direction} from '../store';

    let S0,S1,S2,S3,S4,S5,S6,S7;
    let SelectionClass = "BarBtnSel";
    S0 = SelectionClass;
    let SelSubPage = 0;
    let totalPageContent = 1;
    let pageContent = 1;
    let Y;
    let SelCrop;
    let quant;
    let showYield = false;
    let xPR, xWT, xGP;

    function SelectSubPage(p)
    {        
        pageContent = 1;
        SelSubPage = p;
        S0 = S1 = S2 = S3 = S4 = S5 = S6 = S7 = '';
        switch (p) 
        {
            case 0:
                S0 = SelectionClass;
                totalPageContent = 1;
                break;
            case 1:
                S1 = SelectionClass;
                totalPageContent = 1;
                break;
            case 2:
                S2 = SelectionClass;
                totalPageContent = 3;
                break;
            case 3:
                S3 = SelectionClass;
                totalPageContent = 2;
                break;
            case 4:
                S4 = SelectionClass;
                totalPageContent = 2;
                break;
            case 5:
                S5 = SelectionClass;
                totalPageContent = 2;
                break;
            case 6:
                S6 = SelectionClass;
                totalPageContent = 2;
                break;
            case 7:
                S7 = SelectionClass;
                totalPageContent = 2;
                break;
            default:
                break;
        }
        checkDirection();
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
    

    function checkDirection()
    {
        
        if(totalPageContent == 1)
        { $direction = 0; return;}

        if(pageContent < totalPageContent)
            $direction  = 1;
        else
            $direction = -1;
    }

    async function fetechYield() 
    {        
        let INPUT = {Crop:SelCrop, Quant:quant};        
        let ModelResponse = await fetch('/GetYield',{method: "POST", body:JSON.stringify(INPUT),headers: new Headers({"content-type": "application/json"})});
        if (!ModelResponse.ok)
            throw new Error();
        return await ModelResponse.json();
    }

    async function FindYield()
    {                     
        fetechYield()
            .then(
                res =>
                {
                    xPR = res['Price'];
                    xWT = res['Water'];
                    xGP = res['GD'];
                    showYield = true;
                }
            )
            .catch(
                err=>
                {
                    
                }
            );        
    }
</script>

<svelte:body on:wheel={handleMousemove}/>
<svelte:window bind:scrollY={Y}/>
<main>    
    <!-- <h1 transition:scale="{{duration:800,delay:50, opacity:0.5, start:0}}">Predicting Crop Yield</h1>     -->

    <div transition:scale="{{duration:800,delay:50, opacity:0.5, start:0}}">        
        <button class='BarBtn {S0}' on:click={()=>SelectSubPage(0)}>Yield</button>  
        <button class='BarBtn {S1}' on:click={()=>SelectSubPage(1)}>Overview</button>        
        <button class='BarBtn {S2}' on:click={()=>SelectSubPage(2)}>Analysis</button>        
        <button class='BarBtn {S3}' on:click={()=>SelectSubPage(3)} >Data Exploration</button>        
        <button class='BarBtn {S4}' on:click={()=>SelectSubPage(4)} >Data Preprocessing</button>        
        <button class='BarBtn {S5}' on:click={()=>SelectSubPage(5)}>Model Comparision & Selection</button>        
        <button class='BarBtn {S6}' on:click={()=>SelectSubPage(6)}>Model Result & Conclusion</button>        
        <button class='BarBtn {S7}' on:click={()=>SelectSubPage(7)}>Conclusion</button>     
        <br>
        <br>       
    </div>


    {#if SelSubPage == 0}
    <select id = "myList" bind:value={SelCrop} transition:scale="{{delay:200, duration: 400, start: 0}}">  
        <option>    Choose Crop    </option>  
        <option>Paddy</option>  
        <option>Jowar</option>  
        <option>Bajara</option>  
        <option>Maize</option>  
        <option>Cotton</option>  
        <option>Groundnut</option>  
        <option>Soybeans</option>  
        <option>Wheat</option>  
        <option>Barley</option>  
        <option>Gram</option>  
        </select>  

        <input type="number" style="width:220px" bind:value={quant} transition:scale="{{delay:200, duration: 400, start: 0}}" placeholder="Enter Quantity (in Quintal)">
        <button transition:scale="{{delay:200, duration: 400, start: 0}}" style="margin-left: 5px;" id="clk" on:click={FindYield}>Get Yield</button>
        <br>
        {#if showYield == true}
            <div class="ViewBox" transition:slide>
                Approximate price of entire harvest: ₹ {xPR}
            </div>
            <br>
            <div class="ViewBox" transition:slide>
                Total Quantity of water needed: {xWT} (mm/growth period)
            </div>
            <br>
            <div class="ViewBox" transition:slide>
                Approximate Growing period: {xGP} days
            </div>
        {/if}
    {/if}

    {#if SelSubPage == 1}
        <div class="ViewBox" style="width:500px" transition:slide>
            The science of training machines to learn and produce models for future predictions is widely used, and not for nothing. Agriculture plays a critical role in the global economy. With the continuing expansion of the human population, understanding worldwide crop yield is central to addressing food security challenges and reducing the impacts of climate change. 
            <br><br>
            Crop yield prediction is an important agricultural problem. Agricultural yield primarily depends on weather conditions (rain, temperature, etc), pesticides and accurate information about the history of crop yield is an important thing for making decisions related to agricultural risk management and future predictions.
        </div>
        <div class="ViewBox" style="width:300px" transition:slide>
            In this project the prediction of top 10 most consumed yields all over the world is established by applying machine learning techniques. These corps include: 
            <ul>
                <li>Cassava</li>
                <li>Maize</li>
                <li>Plantains and others </li>
                <li>Potatoes</li>
                <li>Rice, paddy</li>
                <li>Sorghum</li>
                <li>Soybeans</li>
                <li>Sweet potatoes</li>
                <li>Wheat</li>
                <li>Yams</li>
            </ul>
        </div>

        <div class="ViewBox" style="width:600px"transition:slide>
            In the project, machine learning methods are applied to predict crop yield using publicly available data from FAO and World Data Bank. The application of four regression algorithms and comparison of which will render the best results to achieve most accurate yield crops predictions.
        </div>

        <div class="ViewBox" style="width:300px" transition:slide>
            Regression models used for this project:
            <ul>
                <li>Gradient Boosting Regressor</li>
                <li>Random Forest Regressor</li>
                <li>SVM</li>
                <li>Decision Tree Regressor</li>
                <li>K Nearest Neighbours</li>
            </ul>
        </div>
    {/if}

    {#if SelSubPage == 2}
        {#if pageContent == 1}
            <div class="ViewBox" transition:slide>
                <b>Gathering & Cleaning Data</b>
                <br>
                Data collection is the process of gathering and measuring information on variables of interest. FAOSTAT provides access to over 3 million time-series and cross sectional data relating to food and agriculture. The FAO data can be found in csv files. FAOSTAT contains data for 200 countries and more than 200 primary products and inputs in its core data set. It offers national and international statistics on food and agriculture. The first thing to get is the crops yield for each country.
            </div>
            <div class="ViewBox" transition:slide style="width:600px">
                <img src="additional_assets/1.jpg" alt="">        
            </div>
            <div class="ViewBox" transition:slide style="width: 200px;">
                Now the data looks clean and organized, but dropping some of the columns such as Area Code, Domain, Item Code, etc, won't be of any use to the analysis. Also, renaming Value to hg/ha_yield to make it easier to recognise that this is our crop yields production value. The end result is a four columns dataframe that contains: country, item, year and crops yield corresponds to them.
            </div>
            <div class="ViewBox" transition:slide style="width:350px">
                <img src="additional_assets/2.jpg" alt="">        
            </div>
            <div class="ViewBox" transition:slide >
                Using describe() function, few things come clear about the dataframe, where it starts at 1961 and ends at 2016, this is all the available data up to date from FAO. 
            </div>
        {/if}
        {#if pageContent == 2}
            <div class="ViewBox" transition:slide>
                Climatic factors include humidity, sunlight and factors involving the climate. Environmental factors refer to soil conditions. In this model two climate and one environmental factors are selected, rain and temperature and pesticides that influence plant growth and development.
                    <br><br>
                Rain has a dramatic effect on agriculture. For this project rainfall per year information was gathered from the World Data Bank in addition to average temperature for each country.
            </div>
            <div class="ViewBox" transition:slide style="width450px">
                <img src="additional_assets/3.jpg" alt="">        
            </div>
            <div class="ViewBox" transition:slide style="width: 300px;">
                The final dataframe for average rainfall includes; country, year and average rainfall per year. The dataframe starts from 1985 to 2017, on the other hand, the average temperature data frame includes country, year and average recorded temperature. The temperature dataframe starts at 1743 and ends at 2013.
            </div>
        {/if}

        {#if pageContent == 3}
            <div class="ViewBox" transition:slide style="width: 500px;">
                Data for pesticides was collected from FAO, it’s noted that it starts in 1990 and ends in 2016. Merging these data frames together, it's expected that the year range will start from 1990 and end in 2013, that is 23 years worth of data.
            </div>
            <div class="ViewBox" transition:slide style="width450px">
                <img src="additional_assets/4.jpg" alt="">        
            </div>
        {/if}
    {/if}

    {#if SelSubPage == 3}
        {#if pageContent == 1}
            <div class="ViewBox" style="width:500px" transition:slide>
                First of all, knowing how many countries there are in the dataframe in addition to what are the highest crop yield countries are relevant to understand. There are 101 countries in the dataframe, with India having the highest crop yield.
            </div>
            <div class="ViewBox" transition:slide style="width:400px">
                <img src="additional_assets/5.jpg" alt="">        
            </div>
            <div class="ViewBox" transition:slide style="width:500px">
                <img src="additional_assets/6.jpg" alt="">        
            </div>
            <div class="ViewBox" style="width:500px" transition:slide>
                Grouped by the item (crop), India is the highest for production of cassava and potatoes. Potatoes seem to be the dominant crop in the dataset, being the highest in 4 countries. The final dataframe starts from 1990 and ends in 2013, that's 23 years worth of data for 101 countries. 
                <br><br>
                Now, exploring the relationships between the columns of the dataframe, a good way to quickly check correlations among columns is by visualizing the correlation matrix as a heatmap.
            </div>
        {/if}
        {#if pageContent == 2}
            <div class="ViewBox" transition:slide style="width:700px">
                <img src="additional_assets/7.jpg" alt="">        
            </div>
            <div class="ViewBox" style="width:250px" transition:slide>
                It is evident from the heatmap above that all of the variables are independent from each, with no correlations.
            </div>
        {/if}
    {/if}
    
    {#if SelSubPage == 4}
        {#if pageContent == 1}
            <div class="ViewBox" style="width:500px" transition:slide>
                Data Preprocessing is a technique that is used to convert the raw data into a clean data set. In other words, whenever the data is gathered from different sources it is collected in raw format which is not feasible for the analysis.
            </div>
            <div class="ViewBox" style="width:620px" transition:slide>
                In the final dataframe there are two categorical columns in the dataframe, categorical data are variables that contain label values rather than numeric values. The number of possible values is often limited to a fixed set, like in this case, items and countries values. Many machine learning algorithms cannot operate on label data directly. They require all input variables and output variables to be numeric.
            </div>
            <div class="ViewBox" style="width:900px" transition:slide>
                This means that categorical data must be converted to a numerical form. One hot encoding is a process by which categorical variables are converted into a form that could be provided to ML algorithms to do a better job in prediction. For that purpose, One-Hot Encoding will be used to convert these two columns to a one-hot numeric array. 
                <br><br>
                The categorical value represents the numerical value of the entry in the dataset. This encoding will create a binary column for each category and returns a matrix with the results.
            </div>
            <div class="ViewBox" transition:slide style="width:900px">
                <img src="additional_assets/8.jpg" alt="">        
            </div>
        {/if}
        {#if pageContent == 2}
            <div class="ViewBox" transition:slide>
                The features of the data frame will look like the above with 115 columns. Taking a look at the dataset above, it contains features highly varying in magnitudes, units and range. The features with high magnitudes will weigh in a lot more in the distance calculations than features with low magnitudes.
            </div>            
            <div class="ViewBox" transition:slide>
                To suppress this effect, we need to bring all features to the same level of magnitudes. This can be achieved by scaling with MinMaxScaler.
            </div>
            <div class="ViewBox" transition:slide>
                The final step on data preprocessing is the training and testing data. The dataset will be split into two datasets, the training dataset and test dataset. The data usually tend to be split inequality because training the model usually requires as many data-points as possible.The common splits are 70/30 or 80/20 for train/test.
            </div>
        {/if}
    {/if}

    {#if SelSubPage == 5}
        {#if pageContent == 1}
            <div class="ViewBox" style="width:300px" transition:slide>
                Before deciding on an algorithm to use, first we need to evaluate, compare and choose the best one that fits this specific dataset.
            </div>
            <div class="ViewBox" style="width:600px" transition:slide>
                Usually, when working on a machine learning problem with a given dataset, we try different models and techniques to solve an optimization problem and fit the most suitable model, that will neither overfit nor underfit the model. 
            </div>
            <div class="ViewBox" style="width:400px" transition:slide>
                The evaluation metric is set based on the R^2 (coefficient of determination) regression score function, which will represent the proportion of the variance for items (crops) in the regression model. R^2 score shows how well terms (data points) fit a curve or line.
            </div>
            <div class="ViewBox" transition:slide style="width:500px">
                <img src="additional_assets/9.jpg" alt="">        
            </div>
            <div class="ViewBox" transition:slide>
                From results viewed above, Decision Tree Regressor has the highest R^2 score 0f 96%.
            </div>
        {/if}
        {#if pageContent == 2}
            <div class="ViewBox" transition:slide>
                Here we also calculate Adjusted R^2 , where it also indicates how well terms fit a curve or line, but adjusts for the number of terms in a model. If you add more and more useless variables to a model, adjusted r-squared will decrease. If you add more useful variables, adjusted r-squared will increase. Adjusted R2 will always be less than or equal to R2.
            </div>
            <div class="ViewBox" transition:slide style="width:400px">
                <img src="additional_assets/10.jpg" alt="">        
            </div>
            <div class="ViewBox" transition:slide style="width:400px">
                <img src="additional_assets/11.jpg" alt="">        
            </div>
            <div class="ViewBox" transition:slide>
                R^2 and adjusted R^2 results respectively for each item. 
            </div>
        {/if}
    {/if}

    {#if SelSubPage == 6}
        {#if pageContent == 1}
            <div class="ViewBox" style="width:500px" transition:slide>
                The most common interpretation of r-squared is how well the regression model fits the observed data. For example, an r-squared of 60% reveals that 60% of the data fit the regression model. Generally, a higher r-squared indicates a better fit for the model. From the obtained results, it’s clear that the model fits the data to a very good measure of 96%.
            </div>
            <div class="ViewBox" style="width:500px" transition:slide>
                Feature importance is calculated as the decrease in node impurity weighted by the probability of reaching that node. The node probability can be calculated by the number of samples that reach the node, divided by the total number of samples. The higher the value the more important the feature. Getting the 7 top features importance for the model:
            </div>
            <div class="ViewBox" transition:slide style="width:900px">
                <img src="additional_assets/12.jpg" alt="">        
            </div>
        {/if}

        {#if pageContent == 2}
            <div class="ViewBox" style="width:600px" transition:slide>
                The crop being potatoes has the highest importance in the decision making for the model, where it's the highest crop in the dataset. Cassava too, then as expected we see the effect of pesticides, where it's the third most important feature, and then if the crop is sweet potatoes, we see some of the highest crops in features importance in the dataset. 
            </div>
            <div class="ViewBox" style="width:500px" transition:slide>
                If the crop is grown in India, it makes sense since India has the largest crops sum in the dataset. Then comes rainfall and temperature. The first assumption about these features were correct, where they all significantly impact the expected crops yield in the model. 
            </div>
            <div class="ViewBox" transition:slide>
                The boxplot below shows the yield for each item. Potatoes are the highest, Cassava, sweet potatoes and Yams.
            </div>
            <div class="ViewBox" transition:slide style="width:800px">
                <img src="additional_assets/13.jpg" alt="">        
            </div>
        {/if}
    {/if}

    {#if SelSubPage == 7}
        {#if pageContent == 1}
            <div class="ViewBox" transition:slide>
                Decision Tree algorithm has become one of the most used machine learning algorithms both in competitions like Kaggle as well as in business environments. Decision Tree can be used both in classification and regression problems. 
            </div>
            <div class="ViewBox" transition:slide>
                A decision tree typically starts with a single node, which branches into possible outcomes. Each of those outcomes leads to additional nodes, which branch off into other possibilities. A decision node, represented by a square, shows a decision to be made, and an end node shows the final outcome of a decision path. A node represents a single input variable (X) and a split point on that variable, assuming the variable is numeric. The leaf nodes (also called terminal nodes) of the tree contain an output variable (y) which is used to make a prediction. Decision trees regression uses mean squared error (MSE) to decide to split a node in two or more sub-nodes.
            </div>
            <div class="ViewBox" transition:slide>
                The root node is an item potato, which is its most important feature in the model. The model asks if it’s potato then based on that it follows the branch if it’s true or false. The algorithm first will pick a value, and split the data into two subset. For each subset, it will calculate the MSE separately. The tree chooses the value which results in the smallest MSE value up until it reaches a leaf node. 
            </div>
        {/if}
        {#if pageContent == 2}
            <div class="ViewBox" transition:slide style="width:800px">
                <img src="additional_assets/14.jpg" alt="">        
            </div>
            <div class="ViewBox" style="width:300px" transition:slide>
                The figure above shows the goodness of the fit with the predictions visualized as a line. It can be seen that the R Square score is excellent. This means that we have found a good fitting model to predict the crops yield value for a certain country.
            </div>
        {/if}
    {/if}

</main>

<style>
    .BarBtn
	{
		margin-left: 8px;
		margin-right: 20px;
		background:rgba(240, 240, 240, 0);
		border: 0;
		font-size: small;
		font-weight: 650;
		/* font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; */
		border-radius: 20px;		
		transition: 0.8s;
		color: whitesmoke;
	}
    .BarBtn:hover
    {
        backdrop-filter: blur(3px) contrast(1.2) saturate(2.5);
		background-color: rgba(255, 255, 255, 0.062);	
		box-shadow: 0px 0px 2px grey;	
    }

    .BarBtnSel
    {
        backdrop-filter: blur(0px) contrast(-1) saturate(5.1);
		background-color: rgba(255, 255, 255, 0.219);
		box-shadow: 0px 0px 10px black;	
		transition: 0.2s
    }

    .BarBtn:active
	{
		/* backdrop-filter: blur(0px) contrast(2.6) saturate(5.1);
		background-color: rgba(255, 255, 255, 0.219); */
		backdrop-filter: blur(0px) contrast(-1) saturate(5.1);
		background-color: rgba(255, 255, 255, 0.219);
		box-shadow: 0px 0px 10px black;	
		transition: 0.2s
	}

    .ViewBox
    {
        display:inline-block;
		position: relative; 
        backdrop-filter: blur(8px) contrast(2) saturate(-1.1) ;
		background-color: rgba(255, 255, 255, 0.219);	
        box-shadow: 0px 0px 2px grey;	    
        border-radius: 15px;    
        padding: 12px;
        transition: 0.9s;
        vertical-align: top;
        margin: 5px;                      
    }

    img
    {
        width:100%;
    }

    .ViewBox:hover
    {
        backdrop-filter: blur(14px) contrast(3.5) saturate(1.1);
        background-color: rgba(255, 255, 255, 0.219);	
		box-shadow: 0px 0px 10px black;	
		transition: 1.2s;
    }


    select,input
    {        
        border-radius: 60px;
        backdrop-filter: blur(8px) contrast(2) saturate(-1.1) ;
		background-color: rgba(255, 255, 255, 0.219);	        
        outline: none;
        padding-left: 20px;
        color: lightgray;        
        transition:0.5s;
        margin-left: 5px;
    }

    input::-webkit-inner-spin-button
    {
        appearance: none;
    }

    #clk
    {
        border-radius: 60px;
        text-align: left;        
        backdrop-filter: blur(4px) contrast(1) saturate(2.5);
        background-color: rgba(200, 200, 200, 0.103);
        transition:0.8s;
        color: lightgray;        
    }

    #clk:hover
    {
        backdrop-filter: blur(8px) contrast(1.3) saturate(2);
        background-color: rgba(0, 180, 45, 0.103);
        padding-left: 50px;
        transition: 0.8s;
    }

    #clk:active
    {
        backdrop-filter: blur(10px) contrast(0.5) saturate(1);
        background-color: rgba(0, 180, 45, 0.103);
        padding-left: 40px;
        transition: 0.2s;
        box-shadow: 0px 0px 10px black;	
    }
</style>