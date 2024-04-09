import { AppProps } from "next/app";
import store from "../redux/store";
import { Provider } from "react-redux";

const App = ({ Component: PageComponent, pageProps }: AppProps) => {  
  return <PageComponent {...pageProps} />;
};

export default function AppWrapper(props: AppProps) {
  return (
      <Provider store={store}>
          <App {...props} />
      </Provider>
  );
}
