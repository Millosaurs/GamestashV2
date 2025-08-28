import { cn } from "../lib/utils";
import { Gamepad } from "lucide-react";

export const Logo = () => {
  return (
    <span className="flex justify-center items-center">
      <Gamepad size={42} color="#23de32" />
      <span className="px-2 text-2xl font-bold">Gamestash</span>
    </span>
  );
};

export const LogoIcon = () => {
  return (
    <span className="flex justify-center items-center">
      <Gamepad size={48} color="#23de32" />
    </span>
  );
};

export const LogoStroke = () => {
  return (
    <span className="flex justify-center items-center">
      <Gamepad size={48} color="#23de32" />
    </span>
  );
};
