import React, { FC } from "react";

export interface IconInterface {
	icon: string;
	className?: string;
}
export interface IconAnimatedLinkProps {
	className?: string;
	activeClassName?: string;
}
export const Icon: FC<IconInterface> = ({ icon, className }) => {
	const renderIcon = (icon: string) => {
		switch (icon) {
			case "moon":
				return <Moon className={className} />;
			case "sun":
				return <Sun className={className} />;
			case "dashboard":
				return <Dashboard className={className} />;
			case "investments":
				return <Investments className={className} />;
			case "collection":
				return <Collection className={className} />;
			case "submissions":
				return <Submissions className={className} />;
			case "shipping":
				return <Shipping className={className} />;
			case "add-card":
				return <AddCard className={className} />;
			case "package":
				return <Package className={className} />;
			case "add-sub":
				return <AddSub className={className} />;
			case "copy":
				return <Copy className={className} />;
			case "edit":
				return <Edit className={className} />;
			case "move-up":
				return <MoveUp className={className} />;
			case "move-down":
				return <MoveDown className={className} />;
			case "arrow-up-down":
				return <ArrowUpDown className={className} />;
			case "arrow-down":
				return <ArrowDown className={className} />;
			case "arrow-up":
				return <ArrowUp className={className} />;
			default:
				return <Moon className={className} />;
		}
	};
	return renderIcon(icon);
};
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
			<path d='M440-800v487L216-537l-56 57 320 320 320-320-56-57-224 224v-487z' />
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
			<path d='M440-160v-487L216-423l-56-57 320-320 320 320-56 57-224-224v487z' />
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
			<path d='M320-440v-287L217-624l-57-56 200-200 200 200-57 56-103-103v287zM600-80 400-280l57-56 103 103v-287h80v287l103-103 57 56z' />
		</svg>
	);
};
