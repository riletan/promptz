#!/bin/bash

# Check if table name is provided
if [ $# -ne 1 ]; then
    echo "Usage: $0 <table-name>"
    echo "Example: $0 my-dynamodb-table"
    exit 1
fi

TABLE_NAME="$1"
if [ -z "$TABLE_NAME" ]; then
    echo "Error: Could not get table name from SSM parameter store"
    exit 1
fi

# Scan the DynamoDB table to get all prompts
aws dynamodb scan \
    --table-name "$TABLE_NAME" \
    --projection-expression "#id, #n" \
    --expression-attribute-names '{"#id":"id","#n":"name"}' \
    | jq -c '.Items[]' \
    | while read -r item; do
        # Extract values
        id=$(echo $item | jq -r '.id.S')
        title=$(echo $item | jq -r '.name.S')

        # Update the item with copyCount attribute
        aws dynamodb update-item \
            --table-name "$TABLE_NAME" \
            --key "{\"id\":{\"S\":\"$id\"}}" \
            --update-expression "SET copyCount = if_not_exists(copyCount, :zero)" \
            --expression-attribute-values "{\":zero\":{\"N\":\"0\"}}"
        aws dynamodb update-item \
            --table-name "$TABLE_NAME" \
            --key "{\"id\":{\"S\":\"$id\"}}" \
            --update-expression "SET starCount = if_not_exists(starCount, :zero)" \
            --expression-attribute-values "{\":zero\":{\"N\":\"0\"}}"            
        echo "Set copyCount and starCount to 0 for prompt $id"
    done

echo "Completed updating all prompts with initial copyCount and startCount"
