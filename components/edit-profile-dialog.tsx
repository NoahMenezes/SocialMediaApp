"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateProfile } from "@/backend/actions/profile";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

interface UserData {
  name: string;
  bio?: string | null;
  username?: string | null;
}

export function EditProfileDialog({ user }: { user: UserData }) {
  const [open, setOpen] = useState(false);

  async function action(formData: FormData) {
      const res = await updateProfile(formData);
      if (res.success) {
          setOpen(false);
      }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-full font-bold">Edit profile</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form action={action}>
            <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                Name
                </Label>
                <Input
                id="name"
                name="name"
                defaultValue={user.name}
                className="col-span-3"
                required
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                Username
                </Label>
                <Input
                id="username"
                name="username"
                defaultValue={user.username || ""}
                className="col-span-3"
                placeholder="Unique handle"
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="bio" className="text-right">
                Bio
                </Label>
                <Textarea
                id="bio"
                name="bio"
                defaultValue={user.bio || ""}
                className="col-span-3"
                placeholder="Tell us about yourself"
                />
            </div>
            </div>
            <DialogFooter>
            <SubmitButton />
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save changes
        </Button>
    )
}
