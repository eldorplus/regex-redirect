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
                !document.getElementById('regex-trans').contains(event.target);
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

const Redirect = ({redirectUrl}) => {

    const containerRef = React.useRef(null);
    const [isClicked, setIsClicked] = React.useState(false);

    useOutsideClick(containerRef, () => {
        setIsClicked(false);
    });

    const handerRedirect = React.useCallback(async () => {
        log("shout be redirect ==>", redirectUrl.toString())
        setIsClicked(!isClicked);
        const timeout = setTimeout(() => {
            // 👇️ redirects to an external URL
            window.location.replace(redirectUrl);
        }, 3000);

        return () => clearTimeout(timeout);
    }, [isClicked])

    return (
        <span id="regex-trans" className="relative" ref={containerRef}>
            {!isClicked && (<button onClick={handerRedirect}>{redirectUrl.toString()}</button>)}
            {isClicked && (<span>Redirection dans 3 secondes...</span>)}
        </span>
    );
};

// Create a function to wrap up your component
const App = (props) => {

    const [redirectUrls, setRedirectUrls] = React.useState([]);

    React.useEffect(() => {
        const withPathname = [
            {name: 'Portail PIM', path:  'webui/SG_PORTAL_SGDBF'},
            {name: 'Portail Fournisseur', path:'webui/SG_PORTAL_SUPPLIER'}
        ];
        const newRedirectUrls = []

        // https://github.com/sospedra/next.js/blob/canary/packages/next/client/link.tsx
        let {pathname, hostname, origin, search, hash, protocol, port} = window.location
        let domain = hostname;

        if (Object.hasOwn(whitelistHosts, hostname)) {
            log(pathname, hostname)
            domain = whitelistHosts[hostname]
            log('DNS Selected ==>', domain);
        }
        const currentHostname = `${domain}${port ? `:${port}` : ''}`;

        withPathname.map(({ name, path}) => {
            let redirectUrl = new URL(protocol.replace(
                /^http(?!s)/,
                'https'
            ).concat('//').concat(currentHostname))
            //newRedirectUrl.pathname = pathname
            redirectUrl.pathname = path
            redirectUrl.search = search
            redirectUrl.hash = hash
            newRedirectUrls.push({ name, redirectUrl})
        })
        setRedirectUrls(newRedirectUrls)
    }, [])

    return (
        <HttpsRedirect>
            <div>
                <div className="welcome">
                    <h1>Le PIM change d'url de connexion et devient:</h1>
                    <div>
                        {
                            redirectUrls.map(({ name, redirectUrl }, index) => (
                                <p key={index}>
                                    { name }:&nbsp;
                                    <Redirect redirectUrl={redirectUrl}/>
                                </p>
                            ))
                        }
                    </div>
                </div>
                <div>Pensez à la modifier et l'ajouter dans vos favoris !</div>
                <h1>Cette page sera désactivée dans 6 mois </h1>
            </div>
        </HttpsRedirect>
    );
}

// Use the ReactDOM.render to show your component on the browser
ReactDOM.render(<App/>, rootNode)
