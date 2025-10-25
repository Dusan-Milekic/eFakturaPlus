export default function DropDown() {
    return (
        <div className="w-11/12 bg-black/50 backdrop-blur-md rounded-lg p-4 text-white shadow-lg">
            <ul className="mt-2">
                <li className="py-1 px-1 hover:bg-black/30 transition-colors"><a href="#">Account</a></li>
                <li className="py-1 px-1 hover:bg-black/30 transition-colors"><a href="#">About</a></li>
                <li className="py-1 px-1 hover:bg-black/30 transition-colors"><a href="#">Contact</a></li>
            </ul>
        </div>
    )
}
