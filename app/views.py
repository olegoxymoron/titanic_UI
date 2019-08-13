import os
import random

import json, re

import pandas as pd
import numpy as np

from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split

from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

HOME_DIR = BASE_DIR + '/app/templates/index.html'

from django.shortcuts import render

from rest_framework.decorators import api_view

from rest_framework import generics

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

pd.options.mode.chained_assignment = None

train = pd.read_csv(BASE_DIR + '/app/train.csv')

train_copy = train.copy()
train.drop(["PassengerId"], axis = 1, inplace = True)

np.random.seed(666)

def train_get_dummies(train):
    train = train.copy()
    X_train, y_train = train.drop(["Survived"], axis = 1), train["Survived"]
    to_drop = ["Name", "Ticket", "Cabin"]
    try:
        X_train.drop(to_drop, axis = 1, inplace = True)
    except:
        pass
    X_train = pd.get_dummies(X_train, drop_first = True, columns = None)
    return X_train, y_train    
    
baseline = 0.616
prev_acc = baseline

full_data = [train]
#Preprocessing
for dataset in full_data:
    dataset['Embarked'] = dataset['Embarked'].fillna('S')
# Remove all NULLS in the Fare column 
for dataset in full_data:
    dataset['Fare'] = dataset['Fare'].fillna(train['Fare'].median())
# Fill Age
for dataset in full_data:
    age_avg = dataset['Age'].mean()
    age_std = dataset['Age'].std()
    age_null_count = dataset['Age'].isnull().sum()
    age_null_random_list = np.random.randint(age_avg - age_std, age_avg + age_std, size=age_null_count)
    dataset['Age'][np.isnan(dataset['Age'])] = age_null_random_list
    dataset['Age'] = dataset['Age'].astype(int)
# Make PClass categorial
for dataset in full_data:
    dataset["Pclass"] = dataset["Pclass"].astype("str")

# FEATURE ENGINEERING
# Gives the length of the name
train['Name_length'] = train['Name'].apply(len)

# Feature that tells whether a passenger had a cabin on the Titanic
train['Has_Cabin'] = train["Cabin"].apply(lambda x: 0 if type(x) == float else 1)

# Create new feature FamilySize as a combination of SibSp and Parch
for dataset in full_data:
    dataset['FamilySize'] = dataset['SibSp'] + dataset['Parch'] + 1
    
# Create new feature IsAlone from FamilySize
for dataset in full_data:
    dataset['IsAlone'] = 0
    dataset.loc[dataset['FamilySize'] == 1, 'IsAlone'] = 1
    
# Create a new feature CategoricalFare
train['CategoricalFare'] = pd.qcut(train['Fare'], 4)

# Create a New feature CategoricalAge
train['CategoricalAge'] = pd.cut(train['Age'], 5)

# Define function to extract titles from passenger names
def get_title(name):
    title_search = re.search(' ([A-Za-z]+)\.', name)
    # If the title exists, extract and return it.
    if title_search:
        return title_search.group(1)
    return ""
# Create a new feature Title, containing the titles of passenger names
for dataset in full_data:
    dataset['Title'] = dataset['Name'].apply(get_title)
# Group all non-common titles into one single grouping "Rare"
for dataset in full_data:
    dataset['Title'] = dataset['Title'].replace(['Lady', 'Countess','Capt', 'Col','Don', 
                                                 'Dr', 'Major', 'Rev', 'Sir', 'Jonkheer', 'Dona'], 'Rare')
    dataset['Title'] = dataset['Title'].replace('Mlle', 'Miss')
    dataset['Title'] = dataset['Title'].replace('Ms', 'Miss')
    dataset['Title'] = dataset['Title'].replace('Mme', 'Mrs')

    title_mapping = {"Mr": "1", "Miss": "2", "Mrs": "3", "Master": "4", "Rare": "5"}
    dataset['Title'] = dataset['Title'].map(title_mapping)
    dataset['Title'] = dataset['Title'].fillna(0)


def main(X_train, y_train, X_test, y_test):
    model = DecisionTreeClassifier(random_state = 666)
    print('DecisionTreeClassifier')
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    return accuracy_score(y_test, y_pred)

available_columns = ['Pclass', 'Name', 'Sex', 'Age', 'SibSp',
           'Parch', 'Ticket', 'Fare', 'Cabin', 'Embarked', 'Name_length', 'FamilySize',
       'IsAlone', 'CategoricalFare', 'CategoricalAge', 'Title']

base_columns = ["Survived"];

print(list(train))

class FeaturesAPI(APIView):
    def get(self, request, format='json'):
        used_features = {feature: False for feature in available_columns}

        return Response(used_features, status=status.HTTP_202_ACCEPTED)

    def post(self, request, format='json'):
        features = [key for (key,value) in request.data.items() if value==True]

        X_train, y_train = train_get_dummies(train[base_columns + features])
        X_train, X_test, y_train, y_test = train_test_split(X_train, y_train, random_state = 666)

        accuracy = main(X_train, y_train, X_test, y_test)

        return Response(round(accuracy, 4), status=status.HTTP_202_ACCEPTED)

def homepage(request):
    rnd = random.random()

    return render(request, HOME_DIR, {'rnd': rnd})

