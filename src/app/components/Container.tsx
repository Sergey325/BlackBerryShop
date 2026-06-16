interface ContainerProps {
    children: React.ReactNode
}

const Container: React.FC<ContainerProps> = ({children}) => {
    return (
        <div
            className="
                max-w-[1414px]
                px-6
                mx-auto
            "
        >
            {children}
        </div>
    );
};
// {/*mx-auto*/}
// xl:px-20
// md:px-10
// sm:px-2
// px-4
export default Container;