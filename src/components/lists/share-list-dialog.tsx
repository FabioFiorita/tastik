import { useState } from "react";
import {
	ResponsiveDialog,
	ResponsiveDialogContent,
	ResponsiveDialogDescription,
	ResponsiveDialogHeader,
	ResponsiveDialogTitle,
} from "@/components/common/responsive-dialog";
import { EditorCard } from "@/components/lists/editor-card";
import { ShareListOwnerCard } from "@/components/lists/share-list-owner-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAddListEditor } from "@/hooks/actions/use-add-list-editor";
import { useCurrentUser } from "@/hooks/queries/use-current-user";
import { useListEditors } from "@/hooks/queries/use-list-editors";
import type { Id } from "../../../convex/_generated/dataModel";

const MAX_EDITORS_PER_LIST = 10;

interface ShareListDialogProps {
	listId: Id<"lists">;
	listName: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function ShareListDialog({
	listId,
	listName,
	open,
	onOpenChange,
}: ShareListDialogProps) {
	const currentUser = useCurrentUser();
	const { editors } = useListEditors(listId);
	const { addEditor, isPending } = useAddListEditor();
	const [email, setEmail] = useState("");
	const [nickname, setNickname] = useState("");

	const isAtEditorLimit = editors.length >= MAX_EDITORS_PER_LIST;

	const handleAddEditor = async (e: React.SyntheticEvent<HTMLFormElement>) => {
		e.preventDefault();
		const trimmedEmail = email.trim();
		if (!trimmedEmail || isAtEditorLimit) return;
		const trimmedNickname = nickname.trim();
		const success = await addEditor({
			listId,
			email: trimmedEmail,
			nickname: trimmedNickname || undefined,
		});
		if (success) {
			setEmail("");
			setNickname("");
		}
	};

	return (
		<ResponsiveDialog open={open} onOpenChange={onOpenChange}>
			<ResponsiveDialogContent>
				<ResponsiveDialogHeader className="shrink-0">
					<ResponsiveDialogTitle>Share {listName}</ResponsiveDialogTitle>
					<ResponsiveDialogDescription>
						Editors can add, update, and delete items, manage tags, and reorder
						items in this list.
					</ResponsiveDialogDescription>
				</ResponsiveDialogHeader>

				<div className="no-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto">
					<section>
						<h3 className="mb-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
							List
						</h3>
						<div
							className="rounded-lg border border-dashed bg-muted/30 px-4 py-3"
							data-testid="list-card"
						>
							<p className="font-medium text-sm">{listName}</p>
						</div>
					</section>

					<section>
						<h3 className="mb-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
							Owner
						</h3>
						{currentUser && (
							<ul className="space-y-2" data-testid="owner-list">
								<ShareListOwnerCard
									owner={{
										email: currentUser.email,
										name: currentUser.name,
									}}
								/>
							</ul>
						)}
					</section>

					<section>
						<h3 className="mb-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
							Add Editor
						</h3>
						{isAtEditorLimit ? (
							<p
								className="text-muted-foreground text-sm"
								data-testid="editors-limit-message"
							>
								Maximum editors reached.
							</p>
						) : (
							<form
								onSubmit={handleAddEditor}
								className="space-y-2"
								data-testid="add-editor-form"
							>
								<Input
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="Email address"
									type="email"
									disabled={isPending}
									data-testid="add-editor-email-input"
								/>
								<Input
									value={nickname}
									onChange={(e) => setNickname(e.target.value)}
									placeholder="Nickname (optional)"
									disabled={isPending}
									data-testid="add-editor-nickname-input"
								/>
								<Button
									type="submit"
									disabled={isPending || !email.trim()}
									className="w-full"
									data-testid="add-editor-button"
								>
									Add Editor
								</Button>
								<p className="text-muted-foreground text-xs">
									Ask the person for their Tastik account email to add them as
									an editor.
								</p>
							</form>
						)}
					</section>

					<section>
						<h3 className="mb-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
							Editors
						</h3>
						{editors.length > 0 ? (
							<ul className="space-y-2" data-testid="editors-list">
								{editors.map((editor) => (
									<EditorCard key={editor._id} editor={editor} />
								))}
							</ul>
						) : (
							<div
								className="flex items-center justify-center rounded-lg border border-dashed bg-muted/30 px-4 py-6"
								data-testid="editors-empty"
							>
								<p className="text-muted-foreground text-sm">
									No editors added yet.
								</p>
							</div>
						)}
					</section>
				</div>
			</ResponsiveDialogContent>
		</ResponsiveDialog>
	);
}
