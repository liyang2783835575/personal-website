export interface ResumeData {
  name: string;
  title: string;
  bio: string;
  avatar: string;
  contacts: {
    github?: string;
    email?: string;
    linkedin?: string;
    wechat?: string;
  };
  skills: {
    name: string;
    level: number;
    category: "frontend" | "backend" | "tool" | "other";
  }[];
  experience: {
    company: string;
    role: string;
    period: string;
    description: string;
  }[];
  projects: {
    name: string;
    description: string;
    tech: string[];
    link?: string;
    image?: string;
    featured?: boolean;
    category?: "enterprise" | "personal";
    highlights?: { title: string; detail: string }[];
    metrics?: string[];
  }[];
}

export const resume: ResumeData = {
  name: "Li Yang",
  title: "Developer & Creator",
  bio: "热爱技术与创造的开发者。喜欢用代码构建有趣的东西，从前端到后端，从 Web 应用到小游戏，探索技术的边界。目前专注于 AI 应用开发和全栈工程。",
  avatar: "/avatar.png",
  contacts: {
    github: "https://github.com/liyang",
    email: "liyang@example.com",
    wechat: "liyang_dev",
  },
  skills: [
    { name: "TypeScript", level: 90, category: "frontend" },
    { name: "React / Next.js", level: 85, category: "frontend" },
    { name: "HTML / CSS", level: 90, category: "frontend" },
    { name: "Tailwind CSS", level: 85, category: "frontend" },
    { name: "Node.js", level: 80, category: "backend" },
    { name: "Python", level: 75, category: "backend" },
    { name: "Cloudflare Workers", level: 80, category: "backend" },
    { name: "SQL / SQLite", level: 70, category: "backend" },
    { name: "Git", level: 85, category: "tool" },
    { name: "Docker", level: 65, category: "tool" },
    { name: "Cocos Creator", level: 70, category: "other" },
    { name: "AI / LLM 应用", level: 80, category: "other" },
  ],
  experience: [
    {
      company: "独立开发者",
      role: "全栈开发",
      period: "2024 - 至今",
      description:
        "独立开发多个 Web 应用和小游戏项目，涵盖 AI 应用、前端工程、云端部署等领域。",
    },
    {
      company: "星空议会",
      role: "全栈开发 & 产品设计",
      period: "2024",
      description:
        "AI 塔罗占卜应用，前端 Vanilla JS + Tailwind，后端 Cloudflare Workers + D1，集成 Claude API 实现智能解读。",
    },
    {
      company: "打工虾逃游记",
      role: "游戏开发",
      period: "2024",
      description:
        "抖音小游戏，使用 Cocos Creator 3.8.8 开发，包含物理碰撞、距离追踪、障碍物生成等核心系统。",
    },
  ],
  projects: [
    {
      name: "征信产品核心服务",
      description:
        "企业级产品编排引擎，支撑全量业务线。基于 Spring Boot WebFlux 的全异步架构，日处理千万级请求，通过 DAG 六阶段流水线与可配置规则引擎实现产品的动态组装与分发。",
      tech: [
        "Java",
        "Spring Boot WebFlux",
        "Maven",
        "Nacos",
        "Redis/R2M",
        "FMQ",
        "JSF",
        "KMS",
        "Groovy",
        "Guava DAG",
        "Caffeine",
      ],
      featured: true,
      category: "enterprise",
      highlights: [
        {
          title: "双引擎流水线架构",
          detail:
            "兼容旧版责任链模式，同时演进至基于 Google Guava DAG 的六阶段编排引擎，支持产品依赖图的拓扑排序与同层级并发执行，日处理千万级请求。",
        },
        {
          title: "全链路响应式架构",
          detail:
            "基于 CompletableFuture 的非阻塞异步编程模型，从 KMS 加密到远程调用的全链路异步化，消除 Netty IO 线程阻塞瓶颈。",
        },
        {
          title: "产品依赖图引擎",
          detail:
            "构建产品 DAG 依赖图，执行拓扑排序（逆向叶子剥离），同深度产品 CompletableFuture 并发编排，支持硬/软依赖、循环检测与深度限制。",
        },
        {
          title: "Groovy 沙箱规则引擎",
          detail:
            "沙箱化 Groovy 脚本执行环境，Import 白名单 + Token 黑名单（goto 等）+ 1 秒超时中断，支持 4 种响应码规则与自定义引用类型，使客户可自定义产品组装逻辑。",
        },
        {
          title: "多层容错与降级",
          detail:
            "FMQ 消息队列磁盘溢出兜底、带随机抖动的缓存版本刷新防惊群效应、KMS 异步加密非关键路径解耦、敏感日志字段脱敏。",
        },
        {
          title: "壳产品匹配算法",
          detail:
            "三趟匹配算法：逆向数据源签名匹配 → 正向匹配 → 精确保留，支持新旧两种壳产品模式，含超量检测与阻断能力。",
        },
      ],
      metrics: [
        "日均请求 10M+",
        "423 Java 源文件",
        "10 个 Controller",
        "7 套环境 Profile",
        "17+ 缓存实体",
      ],
    },
    {
      name: "运营中心",
      description:
        "全平台业务配置的统一管理中枢。涵盖商户入驻、产品上下架、合约签订、订单授权、计费结算、监控规则编排等核心业务流程，通过 Web UI 支撑运营团队的日常配置工作。",
      tech: [
        "Java 17",
        "Spring Boot",
        "MyBatis-Plus",
        "Nacos",
        "JSF",
        "R2M",
        "Caffeine",
        "MySQL",
        "CAS SSO",
      ],
      category: "enterprise",
      highlights: [
        {
          title: "机构管理",
          detail:
            "商户全生命周期管理——入驻申请、资质审核（营业执照/征信牌照/法人信息，对接工行二要素验证）、证书签发（国密双证）、合约签订、产品授权、计费规则配置。支持多级机构层级（总公司→分公司→事业部），每个机构独立管控配额、费率、权限。OrgBaseInfo + OrgMerchantInfo 双表存储，org_class_id 三级分类，20+ 业务域以机构为核心向外辐射。",
        },
        {
          title: "订单管理",
          detail:
            "客户查询请求的完整链路追踪与计费——OrderInfo（订单）→ OrderItemInfo（订单项）→ OrderItemDetail（计费明细）→ OrderItemDetailArrivedLadderConfig（阶梯计费），配合 AccountCallAuth（调用授权）和 OrderItemChargingProductRelationship（产品关联）。OrderStatusSyncTask 定时任务用 LambdaUpdateWrapper 批量流转订单状态（NOT_STARTED → IN_PROGRESS → COMPLETED），OrderShutdownSyncTask 支持产品级阈值自动关停并邮件告警。",
        },
        {
          title: "Spring Boot + MyBatis-Plus 多域单体架构",
          detail:
            "1,845 个 Java 文件、46 个 Controller、120 个 Mapper，按业务域组织为 20+ 个垂直切片——每个域包含独立的 Controller → Service → Repository → Mapper 调用链，14 个 MapperScan 包共享单一 SqlSessionFactory。选择单体而非微服务的原因：管理控制台场景（非高 QPS）、域间共享核心实体（机构/商户/产品）、跨域操作需要单一事务上下文、降低运维复杂度。",
        },
        {
          title: "80+ 注解驱动的声明式业务校验框架",
          detail:
            "自建声明式验证 DSL——4 个校验类别（订单数据校验 dd/、调用授权校验 callauth/、延迟配置校验 delay/、运营中心校验 oc/），含 80+ 对注解/验证器组合（Order000001~Order000011、CallAuth000002~CallAuth000013 等）。每个注解对应一个验证器实现类，复杂多实体业务规则通过注解声明即生效，而非散落在 Service 代码中。新增校验规则只需加一对注解+验证器，无需修改业务逻辑。",
        },
        {
          title: "AOP 切面解耦缓存一致性",
          detail:
            "单个 @Aspect 切面（BusinessVersionAspect）拦截所有 MyBatis-Plus 的 save/update/delete 方法——通过 JoinPoint 参数反射获取实体 Class → 映射到 VersionBusinessTypeEnum → 以毫秒级时间戳更新 operation_business_version 表。30+ 个 EasyJob 缓存刷新任务（AbstractRefreshCacheTask）定时轮询版本号，仅版本变更时才重建对应缓存投影写入 R2M。业务代码零缓存感知，新增缓存数据集只需加一个 Loader 类。",
        },
        {
          title: "自定义 MyBatis-Plus 拦截器链 + 幂等/熔断",
          detail:
            "三个自定义拦截器：UpdateFillInterceptor（MyBatis @Intercepts 拦截所有 Executor.update，自动注入 modifier + modifiedTime，定时任务通过 ThreadLocal 标记跳过）、UpdateRelatedFieldsMetaHandler（MetaObjectHandler 自动填充 creator/modifier，FillMetaContextHolder 支持数据迁移时覆盖审计字段）、OperatorResultInterceptor（查询后翻译操作人用户名为显示名）。基础设施层：DuplicateRequestInterceptor（Redis MD5 幂等）+ SystemLockInterceptor（Nacos @RefreshScope 热刷新熔断，支持 URL 白名单排除）。",
        },
      ],
      metrics: [
        "1,845 Java 文件",
        "46 Controller",
        "120 Mapper",
        "20+ 业务域",
      ],
    },
    {
      name: "产品中心",
      description:
        "征信产品全生命周期管理平台。支持标准产品、模型产品、打包产品、壳产品、路由产品等多种产品形态的定义与配置，管理变量元数据与路由规则，是产品从设计到上线的统一入口。",
      tech: [
        "Java 17",
        "Spring Boot 3.x",
        "MyBatis-Plus",
        "Nacos",
        "JSF",
        "R2M",
        "Groovy",
        "PMML",
        "MapStruct",
      ],
      category: "enterprise",
      highlights: [
        {
          title: "产品管理",
          detail:
            "6 种产品形态（标准/模型/打包/壳/路由/特征变量），每种有独立的 ServiceImpl 和生命周期规则。标准产品绑定变量与规则后即可发布；模型产品额外管理 PMML 文件，经历草稿→预发布→生产三级流转，每级维护独立配置快照；壳产品管理输入/输出参数映射表，将外部接口翻译为子产品调用；路由产品配置主备/负载策略。产品间通过 product_dependent_relate 表声明强/弱依赖关系。",
        },
        {
          title: "一致性验证",
          detail:
            "产品上线前的形式化验证工作流——3 种验证类型（开发特征 verify_develop、模型特征 verify_model、产品 verify_product）。运营上传 CSV/Excel 样本数据 → 系统执行产品编译后的全链路配置 → 逐样本计算一致率 → 结果/错误文件写入 H3C S3 存储 → VerifyTaskInfo 记录任务状态、样本量、一致率与执行耗时。DataTypeCheckFactory（实现 InitializingBean 自动发现所有 IDataTypeCheck 实现）提供数据结构级预校验，验证不通过阻塞产品发布。",
        },
        {
          title: "产品定义与实现分离架构",
          detail:
            "ProductDefinitionRepo + ProductRealizationRepo 双 Repository 存储。同一产品拥有一份 Definition（名称/编码/元数据）和多份 Realization（版本/状态/实现细节），分别处于草稿/预发/生产状态。ProductService.saveProduct() 在 REPEATABLE_READ 隔离级别下编排 校验→存定义→版本检查→存实现 四步事务，编辑草稿对线上服务零影响。",
        },
        {
          title: "双层路由引擎：主备/加权轮询 + diff 增量更新",
          detail:
            "默认路由 + 账户级覆盖路由双层策略。主备模式强制 exactly one master 约束（DB 层面校验），负载模式支持 0-100 权重分配（非零和校验）。更新时以 diff 算法分别计算待删项 (dbIds − updateIds) 与待增项 (updateIds − dbIds)，仅写入差异行——避免全量 DELETE + INSERT 导致的索引重建与锁竞争。路由变更通过 R2M 推送至下游 prod-core-service 实时生效。",
        },
        {
          title: "多数据源 + 乐观锁并发控制",
          detail:
            "ProductCenterDataSourceConfig 配置 8 个 MapperScan 包共享单一 HikariCP 数据源，显式注册 productCenterTransactionManager Bean。所有写操作标注 @Transactional(transactionManager=\"productCenterTransactionManager\", isolation=REPEATABLE_READ)。MyBatis-Plus OptimisticLockerInnerInterceptor + 实体 @Version 字段——两个运营人员同时编辑同一产品时，后者提交触发乐观锁异常，防止静默覆盖。UpdateRelatedFieldsMetaHandler 通过 CAS SSO 上下文自动填充 creator/modifier。",
        },
        {
          title: "DataTypeCheckFactory 插件化校验 + 自定义验证注解",
          detail:
            "InitializingBean 自动发现机制——DataTypeCheckFactory 在 Spring 容器初始化时扫描所有 IDataTypeCheck 实现类，按类型码构建策略映射，新增数据类型校验只需加一个实现类。自定义 Jakarta Bean Validation 注解：@EnumValid（自动校验枚举值合法性，配合 CodeEnum 接口）+ @NonEditable（运行时反射对比原实体与新实体，拦截已上线产品的不可编辑字段修改）。编译期 MapStruct + 运行时 Jackson 自定义 StringDeserializer（全角转半角 + 路径感知排除列表）双管线覆盖对象映射。",
        },
      ],
      metrics: [
        "1,763 Java 文件",
        "29 Controller",
        "6 种产品形态",
        "51 缓存数据集",
      ],
    },
    {
      name: "星空议会",
      description: "AI 驱动的塔罗占卜 Web 应用，支持每日抽牌、历史记录、AI 解读",
      tech: ["Vanilla JS", "Tailwind CSS", "Cloudflare Workers", "D1", "Claude API"],
      link: "https://github.com/liyang/starry-council",
      category: "personal",
    },
    {
      name: "打工虾逃游记",
      description: "抖音小游戏，可爱画风的跑酷类游戏",
      tech: ["Cocos Creator", "TypeScript", "抖音小游戏 SDK"],
      category: "personal",
    },
    {
      name: "个人网站",
      description: "赛博朋克风格的个人主页，集成 AI 工具集",
      tech: ["Next.js", "React", "Three.js", "Tailwind CSS"],
      category: "personal",
    },
  ],
};
