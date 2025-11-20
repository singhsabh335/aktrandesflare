import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-ak-secondary text-white mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">DevAshish</h3>
            <p className="text-gray-300">
              Your one-stop destination for the latest fashion trends.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link href="/search?category=Men">Men</Link>
              </li>
              <li>
                <Link href="/search?category=Women">Women</Link>
              </li>
              <li>
                <Link href="/search?category=Kids">Kids</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Help</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link href="/faq">FAQ</Link>
              </li>
              <li>
                <Link href="/support">Support</Link>
              </li>
              <li>
                <Link href="/returns">Returns</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <p className="text-gray-300">Email: support@devashish.com</p>
            <p className="text-gray-300">Phone: +91 1800-123-4567</p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2024 DevAshish. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

