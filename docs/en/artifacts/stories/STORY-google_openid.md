# Google Open ID Authentication #

Based on the following information please create a detailed specification which will serve
as input for Claude Sonnet 4 in Agent mode for Copilot to implement the feature.

## Structure ##

Add the following section first:

```markdown
Status: draft
Owner: @angeldomp49
Source Model: Claude Opus 4.1 (Ask Mode)
Last Sync: %%timestamp%%

```

### Project Information ###

- **Project Name**: Xihucalli web

## Feature information ##

## Context ##

Please read the documentation of the project and follow to the libraries links to make sure you
understand how the project works and why are used these libraries.

## Task ##

You wil implement the google authentication by using the openid specifications in order to get the corresponding
access token.

After the success login process you will call a custom api service called "xihucalli authentication" which has an endpoint
"xihucalli/user/info", thus get an a custom access token with the xihucalli user. the request should have the authorization and
"x-identity-provider" headers where authorization is the current access token, the other is the name of the identity provider
that serves to tell xihucalli from where the token is.

Then you have to store this xihucalli access token in local storage.

You have to use the "app/commons/session/authentication/google" directory to store the logic.

Keep in mind in the future we will add facebook open id similarly as the existing cognito openid calls.

The existing guard validates the cognito session, please create another specialized
