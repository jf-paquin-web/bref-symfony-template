import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {Code, Function, LayerVersion, Runtime} from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import {HttpApi} from "@aws-cdk/aws-apigatewayv2-alpha";
import {HttpLambdaIntegration} from "@aws-cdk/aws-apigatewayv2-integrations-alpha";

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const brefLayer = LayerVersion.fromLayerVersionArn(
        this,
        'bref-layer',
        'arn:aws:lambda:us-east-1:534081306603:layer:php-82-fpm:27'
    );

    const lambdaFunction = new Function(this, 'PHPLambdaFunction', {
      functionName: "PHPLambdaFunction",
      runtime: Runtime.PROVIDED_AL2,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(28),
      handler: 'public/index.php',
      code: Code.fromAsset(path.join(__dirname, '../../application')),
      environment: {
        REGION: cdk.Stack.of(this).region,
        APP_ENV: 'dev'
      },
      layers: [
        brefLayer
      ]
    });

    const proxyIntegration = new HttpLambdaIntegration('HttpLambdaIntegration', lambdaFunction);
    new HttpApi(this, 'HttpAPI', {
      apiName: 'PHPLambdaHttpApi',
      createDefaultStage: true,
      defaultIntegration: proxyIntegration
    })
  }
}
