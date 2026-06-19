import Accordion from "./reusable/Accordion";
import {ReactNode} from "react";

type Props = {
    title: string,
    children: ReactNode,
}

const FooterSection = ({title, children,}: Props) => (
    <>
        <div className="sm:hidden text-white">
            <Accordion title={title}>
                {children}
            </Accordion>
        </div>

        <div className="hidden sm:flex flex-col gap-3 text-white">
            <p className="font-semibold mb-1 text-sm md:text-lg">{title}</p>
            {children}
        </div>
    </>
);

export default FooterSection;