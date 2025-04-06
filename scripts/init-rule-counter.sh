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
    --projection-expression "#id" \
    --expression-attribute-names '{"#id":"id"}' \
    | jq -c '.Items[]' \
    | while read -r item; do
        # Extract values
        id=$(echo $item | jq -r '.id.S')

        # Update the item with copyCount attribute
        aws dynamodb update-item \
            --table-name "$TABLE_NAME" \
            --key "{\"id\":{\"S\":\"$id\"}}" \
            --update-expression "SET copyCount = if_not_exists(copyCount, :zero)" \
            --expression-attribute-values "{\":zero\":{\"N\":\"0\"}}"
        aws dynamodb update-item \
            --table-name "$TABLE_NAME" \
            --key "{\"id\":{\"S\":\"$id\"}}" \
            --update-expression "SET downloadCount = if_not_exists(downloadCount, :zero)" \
            --expression-attribute-values "{\":zero\":{\"N\":\"0\"}}"            
        echo "Set copyCount and downloadCount to 0 for projecdt rule $id"
    done

echo "Completed updating all prompts with initial copyCount and downloadCount"
