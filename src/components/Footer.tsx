import React from "react";

const Footer = () => {
  return (
    <footer className="border-t py-6 mt-auto bg-background">
      <div className="container mx-auto text-center">
        <p className="text-sm text-muted-foreground">
          ConcursaApp &copy; {new Date().getFullYear()} - Seu companheiro para
          concursos
        </p>
      </div>
    </footer>
  );
};

export default Footer;
