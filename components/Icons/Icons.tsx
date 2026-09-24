import React, { FC } from "react";

export interface IconInterface {
	icon: string;
	className?: string;
}
export interface IconAnimatedLinkProps {
	className?: string;
	activeClassName?: string;
}

const Moon = ({ className }: { className?: string }) => {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={className}
			fill='currentColor'
			viewBox='0 -960 960 960'
		>
			<path d='M479.96-144Q340-144 242-242t-98-238 97.93-238 237.83-98q13.06 0 25.65 1t25.59 3q-39 29-62 72t-23 92q0 85 58.5 143.5T648-446q49 0 92-23t72-62q2 13 3 25.59t1 25.65q0 139.9-98.04 237.83t-238 97.93m.04-72q82 0 148.78-47.07Q695.55-310.15 727-386q-20 5-39.67 8.5Q667.67-374 648-374q-113.86 0-193.93-80.07T374-648q0-19.67 3.5-39.33Q381-707 386-727q-75.85 31.45-122.93 98.22Q216-562 216-480q0 110 77 187t187 77m-14-250' />
		</svg>
	);
};
const Sun = ({ className }: { className?: string }) => {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			viewBox='0 -960 960 960'
			className={className}
			fill='currentColor'
		>
			<path d='M565-395q35-35 35-85t-35-85q-35-35-85-35t-85 35q-35 35-35 85t35 85q35 35 85 35t85-35Zm-221 51q-56-56-56-136t56-136q56-56 136-56t136 56q56 56 56 136t-56 136q-56 56-136 56t-136-56ZM216-444H48v-72h168v72Zm696 0H744v-72h168v72ZM444-744v-168h72v168h-72Zm0 696v-168h72v168h-72ZM269-642 166-742l51-55 102 104-50 51Zm474 475L642-268l49-51 103 101-51 51ZM640-691l102-101 51 49-100 103-53-51ZM163-217l105-99 49 47-98 104-56-52Zm317-263Z' />
		</svg>
	);
};
const Dashboard = ({ className }: { className?: string }) => {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={className}
			fill='currentColor'
			viewBox='0 -960 960 960'
		>
			<path d='M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120zm200-80v-240H200v240zm80 0h280v-240H480zM200-520h560v-240H200z' />
		</svg>
	);
};
const Investments = ({ className }: { className?: string }) => {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={className}
			fill='currentColor'
			viewBox='0 -960 960 960'
		>
			<path d='M444-200h70v-50q50-9 86-39t36-89q0-42-24-77t-96-61q-60-20-83-35t-23-41 18.5-41 53.5-15q32 0 50 15.5t26 38.5l64-26q-11-35-40.5-61T516-710v-50h-70v50q-50 11-78 44t-28 74q0 47 27.5 76t86.5 50q63 23 87.5 41t24.5 47q0 33-23.5 48.5T486-314t-58.5-20.5T390-396l-66 26q14 48 43.5 77.5T444-252zm36 120q-83 0-156-31.5T197-197t-85.5-127T80-480t31.5-156T197-763t127-85.5T480-880t156 31.5T763-763t85.5 127T880-480t-31.5 156T763-197t-127 85.5T480-80m0-80q134 0 227-93t93-227-93-227-227-93-227 93-93 227 93 227 227 93m0-320' />
		</svg>
	);
};
const Collection = ({ className }: { className?: string }) => {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={className}
			fill='currentColor'
			viewBox='0 -960 960 960'
		>
			<path d='M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h240l80 80h320q33 0 56.5 23.5T880-640H447l-80-80H160v480l96-320h684L837-217q-8 26-29.5 41.5T760-160zm84-80h516l72-240H316zm0 0 72-240zm-84-400v-80z' />
		</svg>
	);
};
const Submissions = ({ className }: { className?: string }) => {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={className}
			fill='currentColor'
			viewBox='0 -960 960 960'
		>
			<path d='M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h168q13-36 43.5-58t68.5-22 68.5 22 43.5 58h168q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120zm0-80h560v-560H200zm80-80h280v-80H280zm0-160h400v-80H280zm0-160h400v-80H280zm221.5-198.5Q510-807 510-820t-8.5-21.5T480-850t-21.5 8.5T450-820t8.5 21.5T480-790t21.5-8.5M200-200v-560z' />
		</svg>
	);
};
const Shipping = ({ className }: { className?: string }) => {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={className}
			fill='currentColor'
			viewBox='0 -960 960 960'
		>
			<path d='M155-195q-35-35-35-85H40v-440q0-33 23.5-56.5T120-800h560v160h120l120 160v200h-80q0 50-35 85t-85 35-85-35-35-85H360q0 50-35 85t-85 35-85-35m113.5-56.5Q280-263 280-280t-11.5-28.5T240-320t-28.5 11.5T200-280t11.5 28.5T240-240t28.5-11.5M120-360h32q17-18 39-29t49-11 49 11 39 29h272v-360H120zm628.5 108.5Q760-263 760-280t-11.5-28.5T720-320t-28.5 11.5T680-280t11.5 28.5T720-240t28.5-11.5M680-440h170l-90-120h-80zM360-540' />
		</svg>
	);
};
const AddCard = ({ className }: { className?: string }) => {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={className}
			fill='currentColor'
			viewBox='0 -960 960 960'
		>
			<path d='M720-160v-120H600v-80h120v-120h80v120h120v80H800v120zm-600 40q-33 0-56.5-23.5T40-200v-560q0-33 23.5-56.5T120-840h560q33 0 56.5 23.5T760-760v200h-80v-80H120v440h520v80zm0-600h560v-40H120zm0 0v-40z' />
		</svg>
	);
};
const Package = ({ className }: { className?: string }) => {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={className}
			fill='currentColor'
			viewBox='0 -960 960 960'
		>
			<path d='M440-183v-274L200-596v274zm80 0 240-139v-274L520-457zm-80 92L160-252q-19-11-29.5-29T120-321v-318q0-22 10.5-40t29.5-29l280-161q19-11 40-11t40 11l280 161q19 11 29.5 29t10.5 40v318q0 22-10.5 40T800-252L520-91q-19 11-40 11t-40-11m200-528 77-44-237-137-78 45zm-160 93 78-45-237-137-78 45z' />
		</svg>
	);
};
const AddSub = ({ className }: { className?: string }) => {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={className}
			fill='currentColor'
			viewBox='0 -960 960 960'
		>
			<path d='M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v268q-19-9-39-15.5t-41-9.5v-243H200v560h242q3 22 9.5 42t15.5 38zm0-120v40-560 243-3zm80-40h163q3-21 9.5-41t14.5-39H280zm0-160h244q32-30 71.5-50t84.5-27v-3H280zm0-160h400v-80H280zM720-40q-83 0-141.5-58.5T520-240t58.5-141.5T720-440t141.5 58.5T920-240 861.5-98.5 720-40m-20-80h40v-100h100v-40H740v-100h-40v100H600v40h100z' />
		</svg>
	);
};

const Copy = ({ className }: { className?: string }) => {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={className}
			fill='currentColor'
			viewBox='0 -960 960 960'
		>
			<path d='M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240zm0-80h360v-480H360zM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80zm160-240v-480z' />
		</svg>
	);
};
const Edit = ({ className }: { className?: string }) => {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={className}
			fill='currentColor'
			viewBox='0 -960 960 960'
		>
			<path d='M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h357l-80 80H200v560h560v-278l80-80v358q0 33-23.5 56.5T760-120zm160-240v-170l367-367q12-12 27-18t30-6q16 0 30.5 6t26.5 18l56 57q11 12 17 26.5t6 29.5-5.5 29.5T897-728L530-360zm481-424-56-56zM440-440h56l232-232-28-28-29-28-231 231zm260-260-29-28zl28 28z' />
		</svg>
	);
};
const MoveUp = ({ className }: { className?: string }) => {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={className}
			fill='currentColor'
			viewBox='0 -960 960 960'
		>
			<path d='M320-160q-117 0-198.5-81.5T40-440q0-107 70.5-186.5T287-718l-63-66 56-56 160 160-160 160-56-57 59-59q-71 14-117 69t-46 127q0 83 58.5 141.5T320-240h120v80zm200-360v-280h360v280zm0 360v-280h360v280zm80-80h200v-120H600z' />
		</svg>
	);
};
const MoveDown = ({ className }: { className?: string }) => {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={className}
			fill='currentColor'
			viewBox='0 -960 960 960'
		>
			<path d='m280-120-56-56 63-66q-106-12-176.5-91.5T40-520q0-117 81.5-198.5T320-800h120v80H320q-83 0-141.5 58.5T120-520q0 72 46 127t117 69l-59-59 56-57 160 160zm240-40v-280h360v280zm0-360v-280h360v280zm80-80h200v-120H600z' />
		</svg>
	);
};

const ArrowDown = ({ className }: { className?: string }) => {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={className}
			fill='currentColor'
			viewBox='0 -960 960 960'
		>
			<path d='M480-344 240-584l56-56 184 184 184-184 56 56z' />
		</svg>
	);
};

const ArrowUp = ({ className }: { className?: string }) => {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={className}
			fill='currentColor'
			viewBox='0 -960 960 960'
		>
			<path d='M480-528 296-344l-56-56 240-240 240 240-56 56z' />
		</svg>
	);
};

const ArrowUpDown = ({ className }: { className?: string }) => {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={className}
			fill='currentColor'
			viewBox='0 -960 960 960'
		>
			<path d='M480-120 300-300l58-58 122 122 122-122 58 58zM358-598l-58-58 180-180 180 180-58 58-122-122z' />
		</svg>
	);
};
const Compress = ({ className }: { className?: string }) => {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={className}
			fill='currentColor'
			viewBox='0 -960 960 960'
		>
			<path d='M120-120v-240h80v160h160v80zm480 0v-80h160v-160h80v240zM287-327l-57-56 57-57H80v-80h207l-57-57 57-56 153 153zm386 0L520-480l153-153 57 56-57 57h207v80H673l57 57zM120-600v-240h240v80H200v160zm640 0v-160H600v-80h240v240z' />
		</svg>
	);
};
const Expand = ({ className }: { className?: string }) => {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={className}
			fill='currentColor'
			viewBox='0 -960 960 960'
		>
			<path d='m680-280-56-56 103-104H520v-80h207L624-624l56-56 200 200zm-400 0L80-480l200-200 56 56-103 104h207v80H233l103 104z' />
		</svg>
	);
};
const FontSize = ({ className }: { className?: string }) => {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={className}
			fill='currentColor'
			viewBox='0 -960 960 960'
		>
			<path d='M560-160v-520H360v-120h520v120H680v520zm-360 0v-320H80v-120h360v120H320v320z' />
		</svg>
	);
};
const Close = ({ className }: { className?: string }) => {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={className}
			fill='currentColor'
			viewBox='0 -960 960 960'
		>
			<path d='m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224z' />
		</svg>
	);
};
const CircleClose = ({ className }: { className?: string }) => {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={className}
			fill='currentColor'
			viewBox='0 -960 960 960'
		>
			<path d='m336-280 144-144 144 144 56-56-144-144 144-144-56-56-144 144-144-144-56 56 144 144-144 144zM480-80q-83 0-156-31.5T197-197t-85.5-127T80-480t31.5-156T197-763t127-85.5T480-880t156 31.5T763-763t85.5 127T880-480t-31.5 156T763-197t-127 85.5T480-80m0-80q134 0 227-93t93-227-93-227-227-93-227 93-93 227 93 227 227 93m0-320' />
		</svg>
	);
};
const Calendar = ({ className }: { className?: string }) => {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={className}
			fill='currentColor'
			viewBox='0 -960 960 960'
		>
			<path d='M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80zm0-80h560v-400H200zm0-480h560v-80H200zm0 0v-80zm280 240q-17 0-28.5-11.5T440-440t11.5-28.5T480-480t28.5 11.5T520-440t-11.5 28.5T480-400m-188.5-11.5Q280-423 280-440t11.5-28.5T320-480t28.5 11.5T360-440t-11.5 28.5T320-400t-28.5-11.5M640-400q-17 0-28.5-11.5T600-440t11.5-28.5T640-480t28.5 11.5T680-440t-11.5 28.5T640-400M480-240q-17 0-28.5-11.5T440-280t11.5-28.5T480-320t28.5 11.5T520-280t-11.5 28.5T480-240m-188.5-11.5Q280-263 280-280t11.5-28.5T320-320t28.5 11.5T360-280t-11.5 28.5T320-240t-28.5-11.5M640-240q-17 0-28.5-11.5T600-280t11.5-28.5T640-320t28.5 11.5T680-280t-11.5 28.5T640-240' />
		</svg>
	);
};
const DollarSign = ({ className }: { className?: string }) => {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={className}
			fill='currentColor'
			viewBox='0 -960 960 960'
		>
			<path d='M441-120v-86q-53-12-91.5-46T293-348l74-30q15 48 44.5 73t77.5 25q41 0 69.5-18.5T587-356q0-35-22-55.5T463-458q-86-27-118-64.5T313-614q0-65 42-101t86-41v-84h80v84q50 8 82.5 36.5T651-650l-74 32q-12-32-34-48t-60-16q-44 0-67 19.5T393-614q0 33 30 52t104 40q69 20 104.5 63.5T667-358q0 71-42 108t-104 46v84z' />
		</svg>
	);
};
const Loading = ({ className }: { className?: string }) => {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			viewBox='0 0 24 24'
			className={className}
			fill='currentColor'
		>
			<path d='M4.3 18.3c-.6-.8-1.1-1.6-1.5-2.5S2.2 14 2.1 13h2.1q.15 1.05.6 2.1c.45 1.05.6 1.3 1.1 1.8l-1.4 1.4ZM2 11c.1-1 .4-1.9.8-2.8s.9-1.7 1.5-2.5l1.4 1.4c-.4.6-.8 1.2-1.1 1.8S4.1 10.2 4 11H1.9Zm9 10.9c-1-.1-1.9-.3-2.8-.7s-1.7-.9-2.5-1.5l1.4-1.5c.6.4 1.2.8 1.9 1.1s1.3.5 2.1.6v2ZM7.1 5.7 5.6 4.2c.8-.6 1.6-1.1 2.5-1.5s1.8-.6 2.8-.7v2q-1.05.15-2.1.6c-1.05.45-1.3.6-1.8 1.1m6 16.2v-2q1.05-.15 2.1-.6c1.05-.45 1.3-.6 1.9-1.1l1.5 1.5c-.8.6-1.6 1.1-2.5 1.5s-1.9.6-2.9.7M17 5.7c-.6-.4-1.2-.8-1.9-1.1S13.7 4.1 13 4V2c1 .1 1.9.3 2.8.7s1.7.9 2.5 1.5l-1.4 1.5Zm2.8 12.6-1.4-1.4c.4-.6.8-1.2 1.1-1.8s.5-1.3.6-2.1h2.1c-.1 1-.4 1.9-.8 2.8s-.9 1.7-1.5 2.5M20 11q-.15-1.05-.6-2.1c-.45-1.05-.6-1.3-1.1-1.8l1.4-1.4c.6.8 1.1 1.6 1.5 2.5s.6 1.8.7 2.8h-2.1Z' />
		</svg>
	);
};

const Checkmark = ({ className }: { className?: string }) => {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={className}
			fill='currentColor'
			viewBox='0 -960 960 960'
		>
			<path d='M382-240 154-468l57-57 171 171 367-367 57 57z' />
		</svg>
	);
};

const PlusSign = ({ className }: { className?: string }) => {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={className}
			fill='currentColor'
			viewBox='0 -960 960 960'
		>
			<path d='M440-280h80v-160h160v-80H520v-160h-80v160H280v80h160zm40 200q-83 0-156-31.5T197-197t-85.5-127T80-480t31.5-156T197-763t127-85.5T480-880t156 31.5T763-763t85.5 127T880-480t-31.5 156T763-197t-127 85.5T480-80m0-80q134 0 227-93t93-227-93-227-227-93-227 93-93 227 93 227 227 93m0-320' />
		</svg>
	);
};

const CircleCheck = ({ className }: { className?: string }) => {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={className}
			fill='currentColor'
			viewBox='0 -960 960 960'
		>
			<path d='m424-296 282-282-56-56-226 226-114-114-56 56zm56 216q-83 0-156-31.5T197-197t-85.5-127T80-480t31.5-156T197-763t127-85.5T480-880t156 31.5T763-763t85.5 127T880-480t-31.5 156T763-197t-127 85.5T480-80m0-80q134 0 227-93t93-227-93-227-227-93-227 93-93 227 93 227 227 93m0-320' />
		</svg>
	);
};

const Open = ({ className }: { className?: string }) => {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={className}
			fill='currentColor'
			viewBox='0 -960 960 960'
		>
			<path d='M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h560v-280h80v280q0 33-23.5 56.5T760-120zm188-212-56-56 372-372H560v-80h280v280h-80v-144z' />
		</svg>
	);
};

const Diamond = ({ className }: { className?: string }) => {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={className}
			fill='currentColor'
			viewBox='0 -960 960 960'
		>
			<path d='M480-120 80-600l120-240h560l120 240zm-95-520h190l-60-120h-70zm55 347v-267H218zm80 0 222-267H520zm144-347h106l-60-120H604zm-474 0h106l60-120H250z' />
		</svg>
	);
};

const Filter = ({ className }: { className?: string }) => {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={className}
			fill='currentColor'
			viewBox='0 -960 960 960'
		>
			<path d='M440-160q-17 0-28.5-11.5T400-200v-240L168-736q-15-20-4.5-42t36.5-22h560q26 0 36.5 22t-4.5 42L560-440v240q0 17-11.5 28.5T520-160zm40-308 198-252H282zm0 0' />
		</svg>
	);
};
const Hamburger = ({ className }: { className?: string }) => {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={className}
			fill='currentColor'
			viewBox='0 -960 960 960'
		>
			<path d='M120-240v-80h720v80zm0-200v-80h720v80zm0-200v-80h720v80z' />
		</svg>
	);
};
const Save = ({ className }: { className?: string }) => {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={className}
			fill='currentColor'
			viewBox='0 -960 960 960'
		>
			<path d='M840-680v480q0 33-23.5 56.5T760-120H200q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h480zm-80 34L646-760H200v560h560zM565-275q35-35 35-85t-35-85-85-35-85 35-35 85 35 85 85 35 85-35M240-560h360v-160H240zm-40-86v446-560z' />
		</svg>
	);
};
const Delete = ({ className }: { className?: string }) => {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={className}
			fill='currentColor'
			viewBox='0 -960 960 960'
		>
			<path d='M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120zm400-600H280v520h400zM360-280h80v-360h-80zm160 0h80v-360h-80zM280-720v520z' />
		</svg>
	);
};

const Charts = ({ className }: { className?: string }) => {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={className}
			fill='currentColor'
			viewBox='0 -960 960 960'
		>
			<path d='M280-280h80v-200h-80zm320 0h80v-400h-80zm-160 0h80v-120h-80zm0-200h80v-80h-80zM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120zm0-80h560v-560H200zm0-560v560z' />
		</svg>
	);
};
const Finance = ({ className }: { className?: string }) => {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={className}
			fill='currentColor'
			viewBox='0 -960 960 960'
		>
			<path d='M320-414v-306h120v306l-60-56zm200 60v-526h120v406zM120-216v-344h120v224zm0 98 258-258 142 122 224-224h-64v-80h200v200h-80v-64L524-146 382-268 232-118z' />
		</svg>
	);
};

const Stacks = ({ className }: { className?: string }) => {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={className}
			fill='currentColor'
			viewBox='0 -960 960 960'
		>
			<path d='M480-400 40-640l440-240 440 240zm0 160L63-467l84-46 333 182 333-182 84 46zm0 160L63-307l84-46 333 182 333-182 84 46zm0-411 273-149-273-149-273 149zm0-149' />
		</svg>
	);
};
const PSA = ({ className }: { className?: string }) => {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			viewBox='0 0 80 30'
			className={className}
			fill='currentColor'
		>
			<path d='M45.25 5.97s.01-.13-.05-.12c-4.6.35-7.07.82-9.94 1.8-2.92 1.04-5.29 2.64-5.29 3.59 0 .43.47.82 1.35 1.12.93.3 1.73.52 2.37.65l4.44 1.04c2.66.61 5.41 1.64 7.02 2.68 1.31.82 1.99 2.03 1.99 3.5 0 6.01-8.08 9.77-21.1 9.77-4.23 0-6.34-.78-6.34-2.38 0-.56.42-1.43 1.31-2.77.68-.95 1.06-1.3 1.73-1.51 2.79-.91 2.45-.82 2.75-.82.16 0 .3.14.3.3 0 .26-.09.35-.47.65l-.81.61c-.05.04-.03.13.04.13 1.2.04 2.35.08 2.67.08 5.54 0 9.94-.82 13.66-2.55 1.65-.74 2.33-1.3 2.33-1.86s-.59-1.04-2.11-1.64c-1.4-.56-3.17-1.08-4.27-1.3l-6.98-1.3c-3.13-.56-4.31-1.6-4.31-3.85 0-.65.17-1.69.51-2.98.72-2.68 1.31-3.46 3.47-4.71C34.05 1.46 39.71-.01 45.08-.01c1.69 0 3.51.22 5.2.61.93.17 1.1.43 1.1 1.51 0 1.25-.38 2.72-.93 3.37-.47.65-.68.78-2.62 1.47-1.23.43-1.73.73-3.76 2.12-.47.3-.72.43-1.01.43-.34 0-.68-.3-.68-.61 0-.26.08-.43.51-.78l2.38-2.15z'></path>
			<path d='M28.09 16.42s-.01-.08-.05-.09c-1.99-.61-3.66-1.8-3.66-4.63 0-.99.3-2.33.55-3.29.44-1.65.89-2.71 1.62-3.58.03-.03.02-.08 0-.1-1.32-1.29-3.4-2.05-6.61-2.05H.21c-.12 0-.21.1-.21.21v23.96c0 .12.09.21.21.21h6.9c.12 0 .21-.1.21-.21v-5.7c0-.12.09-.21.21-.21h14.32c3.62 0 5.46-2.04 6.24-4.51zm-7.03-4.14c0 1.45-.66 2.59-2.37 2.59H7.53c-.12 0-.21-.1-.21-.21v-5.7c0-.12.09-.21.21-.21h10.53c2.21 0 3 .94 3 2.59v.94zm42.1-9.49a.21.21 0 0 0-.18-.11h-9.27c-.08 0-.15.04-.19.11l-6.96 13.14c-.06.12-.04.27.06.36 1.08 1 1.67 2.33 1.67 3.84 0 1.95-.72 4.53-3.78 6.73-.09.06-.05.2.06.2h4.13c.08 0 .15-.05.19-.12l2.06-4.15s.04-.04.07-.04h14.74s.05.02.07.04l2.19 4.16c.04.07.11.11.19.11h7.88c.06 0 .1-.06.07-.12l-13-24.15zm-.19 14.71h-9.18s-.07-.05-.05-.08l4.52-8.99s.08-.04.1 0l4.65 8.99s0 .08-.05.08zM80 26.19c0 .73-.56 1.3-1.28 1.3s-1.29-.57-1.29-1.3.57-1.28 1.29-1.28 1.28.57 1.28 1.28zm-2.25 0c0 .57.41 1.02.98 1.02s.96-.45.96-1.01-.41-1.03-.96-1.03-.97.46-.97 1.02zm.77.67h-.29v-1.28c.11-.02.28-.04.48-.04.24 0 .34.04.44.09.07.06.12.16.12.28 0 .14-.11.25-.26.3v.02c.12.05.19.14.23.31.04.19.06.27.09.32h-.31s-.06-.16-.1-.31c-.02-.14-.1-.2-.26-.2h-.14v.51zm.01-.73h.14c.16 0 .29-.06.29-.19 0-.12-.08-.2-.27-.2-.08 0-.13 0-.16.02v.37z'></path>
		</svg>
	);
};
const Received = ({ className }: { className?: string }) => {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={className}
			fill='currentColor'
			viewBox='0 -960 960 960'
		>
			<path d='M240-400v-160h-80v400h640v-400H400v-80h400q33 0 56.5 23.5T880-560v400q0 33-23.5 56.5T800-80H160q-33 0-56.5-23.5T80-160v-400q0-33 23.5-56.5T160-640h80v-240h320v160H320v320zm-80-160v160zv400z' />
		</svg>
	);
};
const OpenAll = ({ className }: { className?: string }) => {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={className}
			fill='currentColor'
			viewBox='0 -960 960 960'
		>
			<path d='M520-400h80v-120h120v-80H600v-120h-80v120H400v80h120v120ZM320-240q-33 0-56.5-23.5T240-320v-480q0-33 23.5-56.5T320-880h480q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H320Zm0-80h480v-480H320v480ZM160-80q-33 0-56.5-23.5T80-160v-560h80v560h560v80H160Zm160-720v480-480Z' />
		</svg>
	);
};

const Clear = ({ className }: { className?: string }) => {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={className}
			fill='currentColor'
			viewBox='0 -960 960 960'
		>
			<path d='M690-240h190v80H610l80-80Zm-500 80-85-85q-23-23-23.5-57t22.5-58l440-456q23-24 56.5-24t56.5 23l199 199q23 23 23 57t-23 57L520-160H190Zm296-80 314-322-198-198-442 456 64 64h262Zm-6-240Z' />
		</svg>
	);
};

const Add = ({ className }: { className?: string }) => {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			viewBox='0 0 24 24'
			className={className}
		>
			<path
				d='M12,2c5.51,0,10,4.49,10,10s-4.49,10-10,10S2,17.51,2,12,6.49,2,12,2h0ZM12,0C5.37,0,0,5.37,0,12s5.37,12,12,12,12-5.37,12-12S18.63,0,12,0h0Z'
				fill='currentColor'
			/>
			<line
				stroke='currentColor'
				strokeLinecap='round'
				strokeWidth='2'
				x1='12'
				y1='16.5'
				x2='12'
				y2='7.5'
			/>
			<line
				stroke='currentColor'
				strokeLinecap='round'
				strokeWidth='2'
				x1='16.5'
				y1='12'
				x2='7.5'
				y2='12'
			/>
		</svg>
	);
};

const Settings = ({ className }: { className?: string }) => {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={className}
			fill='currentColor'
			viewBox='0 -960 960 960'
		>
			<path d='m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z' />
		</svg>
	);
};

export const ICONS = {
	moon: Moon,
	sun: Sun,
	dashboard: Dashboard,
	investments: Investments,
	collection: Collection,
	submissions: Submissions,
	shipping: Shipping,
	"add-card": AddCard,
	package: Package,
	"add-sub": AddSub,
	add: Add,
	copy: Copy,
	edit: Edit,
	"move-up": MoveUp,
	"move-down": MoveDown,
	"arrow-up-down": ArrowUpDown,
	"arrow-down": ArrowDown,
	"arrow-up": ArrowUp,
	compress: Compress,
	expand: Expand,
	"font-size": FontSize,
	close: Close,
	clear: Clear,
	"circle-close": CircleClose,
	calendar: Calendar,
	"dollar-sign": DollarSign,
	loading: Loading,
	checkmark: Checkmark,
	"plus-sign": PlusSign,
	"circle-check": CircleCheck,
	open: Open,
	"open-all": OpenAll,
	settings: Settings,
	diamond: Diamond,
	filter: Filter,
	hamburger: Hamburger,
	save: Save,
	delete: Delete,
	charts: Charts,
	finance: Finance,
	stacks: Stacks,
	psa: PSA,
	received: Received,
} as const;

export const Icon: FC<IconInterface> = ({ icon, className }) => {
	const IconComponent = ICONS[icon as keyof typeof ICONS] ?? Moon;
	return <IconComponent className={className} />;
};
