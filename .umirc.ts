import { defineConfig } from "dumi";

const logo = "data:image/png;base64,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";

export default defineConfig({
	base: "/",
	favicon: logo,
	hash: true,
	logo,
	mode: "site",
	navs: [
		{ path: "/app", title: "@rayslog/app" },
		{ path: "/image", title: "@rayslog/image" },
		{ path: "/pkg", title: "@rayslog/pkg" },
		{ path: "/standard", title: "@rayslog/standard" },
		{ path: "/utils", title: "@rayslog/utils" },
		{ path: "https://github.com/ht1131589588/rayslog", title: "Github" },
		{
			children: [
				{ path: "https://htonlinezone.cn", title: "🏠 首页" },
				{ path: "https://blog.htonlinezone.cn", title: "📋 博客" }
			],
			path: "https://htonlinezone.cn",
			title: "个人官网"
		}
	],
	publicPath: "/",
	styles: [
		"*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:4px;height:4px;background-color:transparent}::-webkit-scrollbar-track{background-color:transparent}::-webkit-scrollbar-thumb{border-radius:2px;background-color:#f66}p{word-break:break-all}.gap{display:inline-block;width:10px}.mark{font-weight:bold;color:#f66}",
		".contains-task-list{margin-left:15px!important}.task-list-item::marker{color:transparent}.task-list-item input[type=checkbox]{vertical-align:middle}",
		".home-contact{display:flex;justify-content:center}.home-contact-item{display:block;border:1px solid #666;border-radius:5px;height:300px}.home-contact-item:not(:first-child){margin-left:30px}",
		".browser{display:flex;align-items:center;width:100px}.browser img{margin-right:5px;width:25px}",
		"@media screen and (max-width:600px){.home-contact{display:block}.home-contact-item{width:100%;height:auto}.home-contact-item:not(:first-child){margin-left:0;margin-top:30px}}"
	],
	title: "Rayslog"
});