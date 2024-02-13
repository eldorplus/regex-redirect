const prefix = "[regex-redirect]";
const log = (...args) => console.log(prefix, ...args);
const err = (...args) => console.error(prefix, ...args);

const whitelistHosts = {
    'stiboapp.dev.pointp.saint-gobain.net': 'sgdbf-dev.mdm.stibosystems.com',
    'stiboapp.int.pointp.saint-gobain.net': 'sgdbf-int.mdm.stibosystems.com',
    'stiboapp.recette.pointp.saint-gobain.net': 'sgdbf-qa.mdm.stibosystems.com',
    'stiboapp.preprod.pointp.saint-gobain.net': 'sgdbf-ppd.mdm.stibosystems.com',
    'stiboapp.prod.pointp.saint-gobain.net': 'sgdbf-prod.mdm.stibosystems.com'
};

/*
{
    "ancestorOrigins": {
        "0": "https://codepen.io"
    },
    "href": "https://cdpn.io/cpe/boomboom/index.html?editors=0012&key=index.html-f1981af8-7dc2-f8b6-669a-8980d4a8d02a",
    "origin": "https://cdpn.io",
    "protocol": "https:",
    "host": "cdpn.io",
    "hostname": "cdpn.io",
    "port": "",
    "pathname": "/cpe/boomboom/index.html",
    "search": "?editors=0012&key=index.html-f1981af8-7dc2-f8b6-669a-8980d4a8d02a",
    "hash": ""
}
*/

// Obtain the root
const rootNode = document.getElementById("redirect-entry-point");
const isLocalHost = hostname => !!(
    hostname === 'localhost' ||
    hostname === '[::1]' ||
    hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

const useOutsideClick = (ref, callback) => {
    React.useEffect(() => {
        const listener = (event) => {
            const isClickedOutside =
                !ref.current.contains(event.target) &&
                !document.getElementById('gtx-trans').contains(event.target);
            if (isClickedOutside) {
                callback();
            }
        };

        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);

        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref]);
};

const HttpsRedirect = ({disabled, children}) => {
    if (
        !disabled &&
        typeof window !== 'undefined' &&
        window.location &&
        window.location.protocol === 'http:' &&
        !isLocalHost(window.location.hostname)
    ) {
        window.location.href = window.location.href.replace(
            /^http(?!s)/,
            'https'
        );
        return null;
    }

    return children;
};

const Redirect = ({domain, protocol}) => {

    const containerRef = React.useRef(null);
    const [isClicked, setIsClicked] = React.useState(false);

    useOutsideClick(containerRef, () => {
        setIsClicked(false);
    });

    const handerRedirect = React.useCallback(async () => {
        let redirectUrl = protocol.replace(
            /^http(?!s)/,
            'https'
        ).concat('//').concat(domain);
        log("shout be redirect ==>", redirectUrl)
        setIsClicked(!isClicked);
        const timeout = setTimeout(() => {
            // 👇️ redirects to an external URL
            window.location.replace(redirectUrl);
        }, 3000);

        return () => clearTimeout(timeout);
    }, [isClicked])

    return (
        <div className="relative" ref={containerRef}>
            {!isClicked && (<button onClick={handerRedirect}>Redirect to {domain}</button>)}
            {isClicked && (<div>Will redirect in 3 seconds...</div>)}
        </div>
    );
};

const Welcome = ({name}) => {
    // Use the render function to return JSX component
    return (
        <div className="welcome">
            <h1>This {name} will be deactivated in 6 months.</h1>
            <p>Please click here</p>
        </div>
    );
}


// https://github.com/sospedra/next.js/blob/canary/packages/next/client/link.tsx
let {pathname, hostname, origin, search, protocol} = window.location
let domain = hostname;

if (Object.hasOwn(whitelistHosts, hostname)) {
    log(pathname, hostname)
    domain = whitelistHosts[hostname]
    log(domain);
}

// Create a function to wrap up your component
const App = (props) => {

    return (
        <HttpsRedirect>
            <div>
                <Welcome name={hostname}/>
                <Redirect domain={domain} protocol={protocol}/>
            </div>
        </HttpsRedirect>
    );
}

// Use the ReactDOM.render to show your component on the browser
ReactDOM.render(<App/>, rootNode)
