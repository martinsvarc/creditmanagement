import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const PopoverExample = () => (
  <Popover>
    <PopoverTrigger>
      <button>Open Popover</button>
    </PopoverTrigger>
    <PopoverContent>
      <p>This is a popover content.</p>
    </PopoverContent>
  </Popover>
);

export default PopoverExample;
