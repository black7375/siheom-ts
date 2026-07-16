import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog";
import { useState } from "react";

function TodoItem({
	name,
	onDelete,
}: {
	name: string;
	onDelete: () => void;
}) {
	const [open, setOpen] = useState(false);

	return (
		<li
			aria-label={name}
			className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3"
		>
			<span className="text-sm font-medium">{name}</span>
			<AlertDialog open={open} onOpenChange={setOpen}>
				<AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>
					{name} 삭제
				</AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>삭제 확인</AlertDialogTitle>
						<AlertDialogDescription>
							정말 삭제하시겠습니까?
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>취소</AlertDialogCancel>
						<AlertDialogPrimitive.Close
							render={<Button variant="default" />}
							onClick={() => {
								onDelete();
								setOpen(false);
							}}
						>
							삭제
						</AlertDialogPrimitive.Close>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</li>
	);
}

export function DeleteDialog({ initialItems }: { initialItems: string[] }) {
	const [items, setItems] = useState(initialItems);

	return (
		<section aria-label="todo-list" className="mx-auto max-w-md p-4">
			<ul className="flex flex-col gap-3">
				{items.map((item) => (
					<TodoItem
						key={item}
						name={item}
						onDelete={() => {
							setItems((current) => current.filter((name) => name !== item));
						}}
					/>
				))}
			</ul>
		</section>
	);
}
