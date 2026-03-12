import React from "react";

interface PageContainerProps {
    lhs: React.ReactNode[];
    rhs?: React.ReactNode[];
    children: React.ReactElement | React.ReactElement[];
}

const PageContainer = (props: PageContainerProps) => {
    const { rhs, lhs, children } = props;

    function parseNodes(nodes: React.ReactNode[]) {
        if (!Array.isArray(nodes)) {
            return null;
        }

        return nodes.map((node, i) => {
            if (!node) {
                return null;
            }

            if (typeof node === "string") {
                return <h1 key={i} style={{ fontSize: "32px", fontWeight: "bold", color: "white", margin: 0 }}>{node}</h1>;
            }

            if (React.isValidElement(node)) {
                return <div key={i}>{node}</div>;
            }

            // If it's a component object but not an element, ignore it to prevent crash
            return null;
        }).filter(node => node !== null);
    }

    return (
        <section className="contentSpacing">
            <div className={"page-header"} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", paddingTop: "20px" }}>
                <div className="header-left" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                    {parseNodes(lhs)}
                </div>
                <div className="header-right" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {parseNodes(rhs || [])}
                </div>
            </div>
            <div className={"page-content"}>{children}</div>
        </section>
    );
};

export default PageContainer;
