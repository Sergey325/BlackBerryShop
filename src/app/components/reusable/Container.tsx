interface ContainerProps {
    children: React.ReactNode
}

const Container: React.FC<ContainerProps> = ({children}) => {
    return (
        <div
            className="
                w-full
                max-w-[1414px]
                mx-auto
                px-4
                lg:px-6
            "
        >
            {children}
        </div>
    );
};

export default Container;