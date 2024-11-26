#!/bin/bash

# Check if table name is provided
if [ $# -ne 1 ]; then
    echo "Usage: $0 <table-name>"
    echo "Example: $0 my-dynamodb-table"
    exit 1
fi

TABLE_NAME="$1"
LAST_EVALUATED_KEY=""

# Verify the table exists
if ! aws dynamodb describe-table --table-name "$TABLE_NAME" >/dev/null 2>&1; then
    echo "Error: Table '$TABLE_NAME' does not exist or you don't have access to it"
    exit 1
fi

echo "Starting update process for table: $TABLE_NAME"

while true; do
    # Prepare scan command
    SCAN_CMD="aws dynamodb scan \
        --table-name \"$TABLE_NAME\" \
        --attributes-to-get \"id\" \
        --select SPECIFIC_ATTRIBUTES"
    
    # Add ExclusiveStartKey if we have a last evaluated key
    if [ ! -z "$LAST_EVALUATED_KEY" ]; then
        SCAN_CMD="$SCAN_CMD --exclusive-start-key '$LAST_EVALUATED_KEY'"
    fi
    
    # Execute scan
    scan_output=$(eval "$SCAN_CMD")
    
    # Check for errors
    if [ $? -ne 0 ]; then
        echo "Error scanning table: $TABLE_NAME"
        exit 1
    fi
    
    # Extract and process items
    if ! items=$(echo "$scan_output" | jq -r '.Items[] | @json' 2>/dev/null); then
        echo "No items found or error parsing items"
        break
    fi

    # Process only if we have items
    if [ ! -z "$items" ]; then
        echo "$items" | while IFS= read -r item; do
            # Extract id, checking if it exists and is not empty
            if id=$(echo "$item" | jq -r '.id.S' 2>/dev/null) && [ ! -z "$id" ]; then
                # Update item
                update_output=$(aws dynamodb update-item \
                    --table-name "$TABLE_NAME" \
                    --key "{\"id\": {\"S\": \"$id\"}}" \
                    --update-expression "SET #interface = :interfaceValue" \
                    --expression-attribute-names '{"#interface": "interface"}' \
                    --expression-attribute-values '{":interfaceValue": {"S": "CLI"}}' \
                    --return-values NONE 2>&1)
                    
                if [ $? -eq 0 ]; then
                    echo "Successfully updated item with id: $id"
                else
                    echo "Failed to update item with id: $id"
                    echo "Error: $update_output"
                fi
                
                # Small delay to avoid throttling
                sleep 0.1
            fi
        done
    fi
    
    # Check if we need to continue scanning
    LAST_EVALUATED_KEY=$(echo "$scan_output" | jq -r '.LastEvaluatedKey | @json')
    if [ "$LAST_EVALUATED_KEY" = "null" ] || [ -z "$LAST_EVALUATED_KEY" ]; then
        break
    fi
done

echo "Update complete for table: $TABLE_NAME!"
