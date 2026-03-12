import Link from "next/link";

const Header = () => {
    return (
        <header>
            {/* NAVBAR */}
            <nav>
                <ul>
                    <li>
                        <Link href="/check">Vehicle Seller?</Link>
                    </li>
                </ul>    
            </nav>
        </header>
    )
}

export default Header;