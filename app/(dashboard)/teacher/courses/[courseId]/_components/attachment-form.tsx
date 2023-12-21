"use client";

import * as z from "zod";
import axios from "axios";


import { File, ImageIcon, Loader2, Pencil, PlusCircle, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";


import { Button } from "@/components/ui/button";
import { Course,Attachment } from "@prisma/client";
import { FileUpload } from "@/components/file-upload";

interface AttachementFormProps {
  initialData: Course & {attachments:Attachment []};
  courseId: string;
};

const formSchema = z.object({
  url:z.string().min(1),
  name:z.string().min(1)
});

export const AttachementForm = ({
  initialData,
  courseId
}: AttachementFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [deletingId,setdeletingId]=useState<string|null>(null)

  const toggleEdit = () => setIsEditing((current) => !current);

  const router = useRouter();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      
      await axios.post(`/api/courses/${courseId}/attachments`, values);
      toast.success("Course updated");
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  }

  const onDelete = async(id:string)=>{
    try {
      setdeletingId(id);
      await axios.delete(`/api/courses/${courseId}/attachments/${id}`);
      toast.success("Attachement Deleted");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
    finally{
      setdeletingId(null)
    }
  }

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Course Attachments
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing && (
            <>Cancel</>
          )}
          {!isEditing  && (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add a File
            </>
          )}
          
        </Button>
      </div>
      {!isEditing && (
       
        <>
        {initialData.attachments.length==0 && (
          <p className="text-sm mt-2 text-slate-500 italic">
            No attachment yet
          </p>
        )}
        {initialData.attachments.length>0 &&(

          <div className="space-y-2">
            {initialData.attachments.map((attachment)=>(
              <div key={attachment.id}
              className="flex items-center p-3 w-full bg-purple-200 rounded-md"
              >
              <File className="h-5 w-5 mr-2 flex-shrink-0"/>
            <p className="text-xs line-clamp-1">{attachment.name}</p>

            {deletingId === attachment.id && (
              <div className="ml-auto">
                <Loader2 className="h-4 w-4 animate-spin"
                />
              </div>
            )}
            {deletingId !== attachment.id && (
              <button 
              onClick={()=>onDelete(attachment.id)}
              className="ml-auto hover:opacity-75 transition">
                 <X className="h-4 w-4"
                />
              </button>
            )}

              </div>
            ))}


          </div>
        )}
        </>
         
      )}
      {isEditing && (
        <div>
          <FileUpload
            endpoint="courseAttachment"
            onChange={(url,name) => {
              
              if (url && name) {
                onSubmit({url:url,name:name});
              }
            }}
          />
          <div className="text-xs text-muted-foreground mt-4">
           Add resources to your course.
          </div>
        </div>
      )}
    </div>
  )
}