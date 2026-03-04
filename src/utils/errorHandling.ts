import { toast } from "sonner";

export interface AppError {
  code: string;
  message: string;
  details?: any;
}

export class ErrorHandler {
  static handle(error: any) {
    console.error("Global Error Handler:", error);
    
    let message = "Une erreur inattendue est survenue.";
    
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    }
    
    toast.error(message, {
      description: "Si le problème persiste, veuillez contacter le support.",
    });
  }
  
  static wrap<T>(promise: Promise<T>): Promise<T> {
    return promise.catch(err => {
      this.handle(err);
      throw err;
    });
  }
}
