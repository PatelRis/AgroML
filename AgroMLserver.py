import csv
import json
import pickle
import sklearn
import torch 
import torch.nn as nn
import torch.nn.functional as F
from NNmodelLoader import ResNet9
import torch
from torchvision import transforms
from PIL import Image
import io
from io import BytesIO
import os
print(" *** Loading Flask *")
from flask import Flask, send_from_directory, request, jsonify, Markup


    
app = Flask(__name__)

################## LOAD ML MODEL #########################
print("\n *** Loading ML Model *\n")
filename = 'Random Forest.pkl'
model = pickle.load(open(filename, 'rb'))
print("\n *** Model Loaded *\n")
#######################################################


################ LOAD NN MODEL ############################
print("\n *** Loading NN model *\n")
disease_classes = ['Apple : Scab',
                   'Apple : Black Rot',
                   'Apple : Cedar rust',
                   'Apple : Healthy',
                   'Blueberry : Healthy',
                   'Cherry : Powdery Mildew',
                   'Cherry : Healthy',
                   'Corn : Cercospora Leaf Spot | Gray Leaf Spot',
                   'Corn : Common Rust',
                   'Corn : Northern Leaf Blight',
                   'Corn : Healthy',
                   'Grape : Black Rot',
                   'Grape : Esca | Black Measles',
                   'Grape : Leaf Blight | Isariopsis Leaf Spot',
                   'Grape : Healthy',
                   'Orange : Haunglongbing | Citrus Greening',
                   'Peach : Bacterial Spot',
                   'Peach : Healthy',
                   'Pepper bell : Bacterial Spot',
                   'Pepper bell : Healthy',
                   'Potato : Early Blight',
                   'Potato : Late Blight',
                   'Potato : Healthy',
                   'Raspberry : Healthy',
                   'Soybean : Healthy',
                   'Squash : Powdery Mildew',
                   'Strawberry : Leaf Scorch',
                   'Strawberry : Healthy',
                   'Tomato : Bacterial Spot',
                   'Tomato : Early Blight',
                   'Tomato : Late Blight',
                   'Tomato : Leaf Mold',
                   'Tomato : Septoria Leaf Spot',
                   'Tomato : Spider Mites | Two-Spotted Spider Mite',
                   'Tomato : Target Spot',
                   'Tomato : Yellow Leaf Curl Virus',
                   'Tomato : Mosaic Virus',
                   'Tomato : Healthy']


disease_model_path = 'plant-disease-model.pth'
disease_model = ResNet9(3, len(disease_classes))
disease_model.load_state_dict(torch.load(
    disease_model_path, map_location=torch.device('cpu')))
disease_model.eval()


def predict_image(img, model=disease_model):
    """
    Transforms image to tensor and predicts disease label
    :params: image
    :return: prediction (string)
    """
    transform = transforms.Compose([
        transforms.Resize(256),
        transforms.ToTensor(),
    ])
    image = Image.open(io.BytesIO(img))
    img_t = transform(image)
    img_u = torch.unsqueeze(img_t, 0)

    # Get predictions from model
    yb = model(img_u)
    # Pick index with highest probability
    _, preds = torch.max(yb, dim=1)
    prediction = disease_classes[preds[0].item()]
    # Retrieve the class label
    return prediction



print("\n *** Model Loaded *")
###################### LOAD CROPINFO CVS ################################
print("\n *** Loading DataSets *\n")
CropInfoDS = dict()
CropPWGD = dict()
with open('CropDesc.csv','r') as csvfile:    
    csvFile = csv.reader(csvfile)
    #Skip header row
    csvFile.__next__()
    #parse CVS file into hash mapped dictionary
    for lines in csvFile:
        CropInfoDS.update({lines[0]:lines[1]})

with open('CropInfo(PWGD).csv','r') as csvfile:
    csvFile = csv.reader(csvfile)
    #Skip header row
    csvFile.__next__()
    #parse CVS file into hash mapped dictionary
    for lines in csvFile:
        CropPWGD.update({lines[0]:[lines[2], lines[3],lines[4]]})
    
#for key, value in CropInfoDS.items():
    #print ("{:<10} {:<10}".format(key, value))
print("\n *** DataSet Loaded *\n")
#########################################################################

####################### Load Disease info CSV ##########################
print("\n *** Loading DataSet *\n")
DiseaseInfoDS = dict()
with open('disease_info.csv','r') as csvfile:    
    csvFile = csv.reader(csvfile)
    #Skip header row
    csvFile.__next__()
    #parse CVS file into hash mapped dictionary
    for lines in csvFile:
        DiseaseInfoDS.update({lines[1]:[lines[2],lines[3],lines[4]]})
print("\n *** DataSet Loaded *\n")
########################################################################

############################## SERVER ###########################################
print("\n *** Server Started *\n")
# Path for Svelte home page
@app.route("/")
def indexPage():
    return send_from_directory('AgroML/public', 'index.html')

# Path for Svelte crop page
@app.route("/Crop")
def cropPage():
    return send_from_directory('AgroML/public', 'index.html')

# Path for Svelte plant disease page
@app.route("/PlantDisease")
def plantDiseasePage():
    return send_from_directory('AgroML/public', 'index.html')

# Path for Svelte Crop Yield page
@app.route("/CropYield")
def cropYieldPage():
    return send_from_directory('AgroML/public', 'index.html')

# Path for all the static files (compiled JS/CSS, etc.)
@app.route("/<path:path>")
def home(path):
    return send_from_directory('AgroML/public', path)


#Path for triggering model prediction
@app.route('/TriggerModel',methods = ['POST', 'GET'])
def ML_model_trigger():
    print("\n *** Running model *")
    inp = request.get_json()
    # inp['N']     -- Nitrogen
    # inp['P']     -- Phosphorus
    # inp['K']     -- Potassium
    # inp['pH']    -- P.H value
    # inp['Rfall'] -- RainFall
    # inp['Temp']  -- Temperature
    # inp['Hum']   -- Humidity
    
    #######################################
    # RUN ML MODEL HERE AND RETURN ANSWER #
    # like:-                              #
    # ans = model.predict(inp['N'])       #
    # prediction = ans[0]                 #
    #######################################
    
    prediction = (model.predict([[inp['N'], inp['P'], inp['K'], inp['Temp'], inp['Hum'], inp['pH'], inp['Rfall']]]))[0]    
    desc = CropInfoDS[prediction]    
    return json.dumps({"result":prediction, "desc":desc})

#Path for triggering neural network
@app.route('/TriggerNeuralNet',methods = ['POST', 'GET'])
def DNN_model_trigger():
    print("Running Neural Net")
    #for f in request.files:
        #print(f)
    file = request.files.get("PLANTimage")
    print(file)    
    file.save(file.filename)
    os.remove(file.filename)
    img = Image.open(file)
    buf = BytesIO()    
    img.save(buf, 'jpeg')
    buf.seek(0)
    image_bytes = buf.read()
    prediction_name = predict_image(image_bytes)    
    prediction = DiseaseInfoDS[prediction_name]    
    buf.close()
    return json.dumps({"Name":prediction_name, "Desc":prediction[0], "Possible Steps":prediction[1], "img":prediction[2]})


#Path to get CropYield data
@app.route('/GetYield',methods = ['POST', 'GET'])
def GetYield():
    inp = request.get_json()
    print(inp['Crop'])
    REC = CropPWGD[inp['Crop']]    
    P = int(REC[0]) * int(inp['Quant'])
    return json.dumps({"Price":P,"Water":REC[1], "GD":REC[2]})
##################################################################################


if __name__ == "__main__":
    app.run(host='0.0.0.0',port=8080,debug=False)
