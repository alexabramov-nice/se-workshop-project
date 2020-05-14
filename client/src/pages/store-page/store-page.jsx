import React from "react";
import {ProductsGrid} from "../../components/products-grid/products-grid";
import {Layout} from "antd";
import {StoreMenu} from "../../components/store-menu/store-menu.component";


const {Sider, Header, Content} = Layout;
const titles = ["Our Products", "Your Discount Policy", "Your Buying Policy", "Manage Permissions"];

class StorePage extends React.Component {

    state = {title: titles[0]};

    onChange = (e) => {
        const titleIdx = parseInt(e.key) - 1;
        this.setState({title: titles[titleIdx]});
    }

    render() {
        return (
            <Layout className="site-layout" style={{backgroundColor: "white"}}>
                <Header style={{backgroundColor: "white", fontSize: "25px"}}>
                    {this.state.title}
                </Header>
                <Layout>
                    <Content
                        className="site-layout-background"
                        style={{
                            padding: "0px 30px",
                            minHeight: "72vh",
                            backgroundColor: "white",
                        }}
                    >
                        <ProductsGrid />
                    </Content>
                    <Sider>
                        <StoreMenu onChange={this.onChange}/>
                    </Sider>
                </Layout>
            </Layout>
        );
    }
}

export {StorePage};
