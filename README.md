# Require API key for methods

AWS SAM has severe issues with parameterising the ApiKeyRequired property.

This custom cloudformation resource will update any non-OPTIONS request method to set it to require an API key.
