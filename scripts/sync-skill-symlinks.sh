#!/usr/bin/env bash

set -euo pipefail

SOURCE_DIR=".agents/skills"
TARGET_DIRS=(".cursor/skills" ".codex/skills" ".claude/skills")

if [ ! -d "$SOURCE_DIR" ]; then
	echo "Error: Source directory $SOURCE_DIR does not exist"
	exit 1
fi

missing_symlinks=0

for skill_dir in "$SOURCE_DIR"/*; do
	if [ ! -d "$skill_dir" ]; then
		continue
	fi

	skill_name=$(basename "$skill_dir")
	target_path="../../$SOURCE_DIR/$skill_name"

	for target_dir in "${TARGET_DIRS[@]}"; do
		if [ ! -d "$target_dir" ]; then
			echo "Warning: Target directory $target_dir does not exist, skipping"
			continue
		fi

		symlink_path="$target_dir/$skill_name"

		if [ ! -L "$symlink_path" ] || [ ! -e "$symlink_path" ]; then
			if [ -e "$symlink_path" ]; then
				echo "Warning: $symlink_path exists but is not a symlink, skipping"
				continue
			fi

			ln -s "$target_path" "$symlink_path"
			echo "Created symlink: $symlink_path -> $target_path"
			missing_symlinks=$((missing_symlinks + 1))
		fi
	done
done

if [ $missing_symlinks -gt 0 ]; then
	echo "Synced $missing_symlinks missing symlink(s)"
else
	echo "All skill symlinks are up to date"
fi

exit 0
