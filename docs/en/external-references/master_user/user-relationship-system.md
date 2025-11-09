# User Relationship System

## Check if the user is already registered

Once the user is authenticated, the user relationship system will be invoked.

First, the user relationship system will search for the email address and the identity provider name to find a Login
Information record and its associated Master User record.

## Search for matching user information to create a new one

In the case of the email address with the identity provider name is not found.

The user relationship system will perform a text-based search given the following information:

- User name
- Email Address
- First Name and Last Name combined

This information is extracted from the external identity provider user registry.

The search will be performed against the Master User records and the Login Information records.

If any of the criteria match with a Master User record, the client user will be prompted to ask if they want to register
a new login information and associate it with the existing Master User record.

If any of the criteria match with a Login Information record, the client user will be prompted to ask if they want to
associate the Login Information record with an existing Master User record.

That is already associated with the Login Information record.

If the client user refuses to associate the Login Information record with an existing Master User record, then a new
Master User record will be created, the same as the Login Information record.

Depending on the matching result of the search, the message to be displayed to the client user will be different.
To avoid the disclosure of information about existing users in the system.

If an exact match is found in the system, the message will be:

User Relationship System: A user with the same username or email address already exists in the system.

The same for the first name and last name.

If the match is partial, the message will be:

User Relationship System: A very similar user already exists with the system, the username or email address may be the
same.

The same for the first name and last name.

## Deep Text-Based Search

The search will be performed in the following way:
email, ignore case, make trim for the two values to compare
username, ignore case, make trim for the two values to compare, ignore any inner space for the two values to compare
first name with last name, ignore cases, make trim for the two values to compare, ignore any inner space for the two
values to compare

For example:

search username: user123 -> record username: user 123 -> result: matches
search full name: John Doe -> record full name: JohnDoe -> result: matches

The search will be performed against the Master User records and the Login Information records, for the following
fields:

Master User Profile Display Name: User Search Username, User Search Email, User Search Full Name
Master User Profile Email: User Search Username, User Search Email, User Search Full Name
Login Information IDP Original Username: User Search Username, User Search Email, User Search Full Name
Login Information Email: User Search Username, User Search Email
Login Information First Name + Last Name: User Search Full Name