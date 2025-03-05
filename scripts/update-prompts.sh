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
    --projection-expression "id, sdlc_phase, interface, category" \
    | jq -c '.Items[]' \
    | while read -r item; do
        # Extract values
        id=$(echo $item | jq -r '.id.S')
        sdlc_phase=$(echo $item | jq -r '.sdlc_phase.S')
        interface=$(echo $item | jq -r '.interface.S')
        category=$(echo $item | jq -r '.category.S')

        # Create tags array from the values
        tags="[{\"S\":\"$sdlc_phase\"},{\"S\":\"$interface\"},{\"S\":\"$category\"}]"

        # Update the item with new attributes
        aws dynamodb update-item \
            --table-name "$TABLE_NAME" \
            --key "{\"id\":{\"S\":\"$id\"}}" \
            --update-expression "SET #pub = :pubVal, #tags = :tagsVal" \
            --expression-attribute-names '{"#pub":"public","#tags":"tags"}' \
            --expression-attribute-values "{\":pubVal\":{\"BOOL\":true},\":tagsVal\":{\"L\":$tags}}"
            
        echo "Updated prompt $id with tags: $tags"
    done

echo "Completed updating all prompts"