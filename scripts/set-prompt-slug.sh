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

# Function to slugify text (implementing the same logic as formatter.ts)
slugify() {
    local text="$1"
    echo "$text" | \
    awk '{print tolower($0)}' | \
    sed -e 's/[àáâãäå]/a/g' \
        -e 's/[èéêë]/e/g' \
        -e 's/[ìíîï]/i/g' \
        -e 's/[òóôõö]/o/g' \
        -e 's/[ùúûü]/u/g' \
        -e 's/[ýÿ]/y/g' \
        -e 's/[ñ]/n/g' \
        -e 's/[ß]/ss/g' \
        -e 's/[^a-z0-9]/-/g' \
        -e 's/--*/-/g' \
        -e 's/^-//' \
        -e 's/-$//' | \
    tr -d '[:space:]'
}

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

        # Generate slug from title
        slug=$(slugify "$title")

        # Update the item with new slug attribute
        aws dynamodb update-item \
            --table-name "$TABLE_NAME" \
            --key "{\"id\":{\"S\":\"$id\"}}" \
            --update-expression "SET #slug = :slugVal" \
            --expression-attribute-names '{"#slug":"slug"}' \
            --expression-attribute-values "{\":slugVal\":{\"S\":\"$slug\"}}"
            
        echo "Updated prompt $id with slug: $slug"
    done

echo "Completed updating all prompts with slugs"
