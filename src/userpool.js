import {CognitoUserPool} from 'amazon-cognito-identity-js';

var poolData = {
	UserPoolId: 'us-east-1_SkEiQXpWL',
	ClientId: '7chorsb4qdjae6d6210j28ghmj', 
};

export default new CognitoUserPool(poolData);