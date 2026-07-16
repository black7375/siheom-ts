import { Button } from "@test/components/base/buttons/button";
import { useState } from "react";
import { Dialog, DialogTrigger, Heading, Modal, ModalOverlay } from "react-aria-components";

function TodoItem({ name, onDelete }: { name: string; onDelete: () => void }) {
  return (
    <li
      aria-label={name}
      className="flex items-center justify-between gap-4 rounded-lg border border-primary px-4 py-3"
    >
      <span className="text-md font-medium text-primary">{name}</span>
      <DialogTrigger>
        <Button color="secondary-destructive" size="sm">
          {name} 삭제
        </Button>
        <ModalOverlay className="fixed inset-0 z-50 flex items-center justify-center bg-overlay/70">
          <Modal className="w-full max-w-md rounded-xl bg-primary p-6 shadow-xl">
            <Dialog className="flex flex-col gap-4 outline-none">
              <Heading slot="title" className="text-lg font-semibold text-primary">
                삭제 확인
              </Heading>
              <p className="text-sm text-secondary">정말 삭제하시겠습니까?</p>
              <div className="flex justify-end gap-2">
                <Button slot="close" color="secondary" size="sm">
                  취소
                </Button>
                <Button slot="close" color="primary-destructive" size="sm" onPress={onDelete}>
                  삭제
                </Button>
              </div>
            </Dialog>
          </Modal>
        </ModalOverlay>
      </DialogTrigger>
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
