#!/usr/bin/env python3
"""
Script to reorganize OpenAPI paths by their tags
"""
import yaml
import sys
from collections import defaultdict, OrderedDict

def load_yaml_preserving_order(file_path):
    """Load YAML file preserving order"""
    with open(file_path, 'r') as file:
        return yaml.safe_load(file)

def reorganize_paths_by_tags(api_spec):
    """Reorganize paths by grouping them according to their tags"""

    # Extract tag order from the tags definition
    tag_order = [tag['name'] for tag in api_spec.get('tags', [])]
    print(f"Tag order: {tag_order}")

    # Group paths by their primary tag
    paths_by_tag = defaultdict(list)

    for path, path_spec in api_spec['paths'].items():
        print(f"\nProcessing path: {path}")

        # Find the first tag from any operation in this path
        primary_tag = None
        for method, operation in path_spec.items():
            if isinstance(operation, dict) and 'tags' in operation:
                if operation['tags']:
                    primary_tag = operation['tags'][0]
                    print(f"  Found tag: {primary_tag} in {method}")
                    break

        if primary_tag:
            paths_by_tag[primary_tag].append((path, path_spec))
        else:
            # Fallback for paths without tags
            paths_by_tag['untagged'].append((path, path_spec))
            print(f"  No tags found - adding to 'untagged'")

    # Create new ordered paths dictionary
    new_paths = OrderedDict()

    # Add paths in tag order
    for tag in tag_order:
        if tag in paths_by_tag:
            print(f"\nAdding {len(paths_by_tag[tag])} paths for tag '{tag}':")
            for path, path_spec in sorted(paths_by_tag[tag], key=lambda x: x[0]):
                print(f"  {path}")
                new_paths[path] = path_spec

    # Add any untagged paths at the end
    if 'untagged' in paths_by_tag:
        print(f"\nAdding {len(paths_by_tag['untagged'])} untagged paths:")
        for path, path_spec in sorted(paths_by_tag['untagged'], key=lambda x: x[0]):
            print(f"  {path}")
            new_paths[path] = path_spec

    # Add any tags not in the original tag order
    for tag in paths_by_tag:
        if tag not in tag_order and tag != 'untagged':
            print(f"\nAdding {len(paths_by_tag[tag])} paths for unlisted tag '{tag}':")
            for path, path_spec in sorted(paths_by_tag[tag], key=lambda x: x[0]):
                print(f"  {path}")
                new_paths[path] = path_spec

    return new_paths

def main():
    input_file = 'api.yaml'
    output_file = 'api.yaml.sorted'

    print(f"Loading {input_file}...")
    api_spec = load_yaml_preserving_order(input_file)

    print("Original paths order:")
    for i, path in enumerate(api_spec['paths'].keys(), 1):
        print(f"  {i}. {path}")

    print("\nReorganizing paths by tags...")
    new_paths = reorganize_paths_by_tags(api_spec)

    print(f"\nNew paths order:")
    for i, path in enumerate(new_paths.keys(), 1):
        print(f"  {i}. {path}")

    # Update the API spec with new paths order
    api_spec['paths'] = new_paths

    print(f"\nWriting reorganized API to {output_file}...")

    # Convert OrderedDict to regular dict for proper YAML serialization
    api_spec['paths'] = dict(new_paths)

    with open(output_file, 'w') as file:
        yaml.dump(api_spec, file, default_flow_style=False, sort_keys=False, width=float('inf'), allow_unicode=True)

    print(f"\nDone! The API has been reorganized by tags and saved to {output_file}")
    print("\nTo apply the changes:")
    print(f"  mv {output_file} {input_file}")

if __name__ == "__main__":
    main()
