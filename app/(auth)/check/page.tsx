
import Link from "next/link";

const SellerIntroductionPage = () => {
  return (
    <div>
        {/* login / register buttons*/}
        <Link href="/login">Login to old seller account</Link>
        <hr />
        <Link href="/register">Register as a new Seller</Link>
    </div>
  );
};

export default SellerIntroductionPage;