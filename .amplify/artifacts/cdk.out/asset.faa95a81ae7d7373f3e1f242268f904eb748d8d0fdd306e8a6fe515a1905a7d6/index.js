"use strict";
var f = Object.create,
  i = Object.defineProperty,
  I = Object.getOwnPropertyDescriptor,
  C = Object.getOwnPropertyNames,
  w = Object.getPrototypeOf,
  P = Object.prototype.hasOwnProperty,
  A = (t, e) => {
    for (var o in e) i(t, o, { get: e[o], enumerable: !0 });
  },
  d = (t, e, o, r) => {
    if ((e && typeof e == "object") || typeof e == "function")
      for (let s of C(e))
        !P.call(t, s) &&
          s !== o &&
          i(t, s, {
            get: () => e[s],
            enumerable: !(r = I(e, s)) || r.enumerable,
          });
    return t;
  },
  l = (t, e, o) => (
    (o = t != null ? f(w(t)) : {}),
    d(
      e || !t || !t.__esModule
        ? i(o, "default", { value: t, enumerable: !0 })
        : o,
      t,
    )
  ),
  B = (t) => d(i({}, "__esModule", { value: !0 }), t),
  q = {};
A(q, { autoDeleteHandler: () => S, handler: () => H }), (module.exports = B(q));
var h = require("@aws-sdk/client-s3"),
  y = l(require("https")),
  m = l(require("url")),
  a = {
    sendHttpRequest: D,
    log: T,
    includeStackTraces: !0,
    userHandlerIndex: "./index",
  },
  p = "AWSCDK::CustomResourceProviderFramework::CREATE_FAILED",
  L = "AWSCDK::CustomResourceProviderFramework::MISSING_PHYSICAL_ID";
function R(t) {
  return async (e, o) => {
    let r = { ...e, ResponseURL: "..." };
    if (
      (a.log(JSON.stringify(r, void 0, 2)),
      e.RequestType === "Delete" && e.PhysicalResourceId === p)
    ) {
      a.log("ignoring DELETE event caused by a failed CREATE event"),
        await u("SUCCESS", e);
      return;
    }
    try {
      let s = await t(r, o),
        n = k(e, s);
      await u("SUCCESS", n);
    } catch (s) {
      let n = { ...e, Reason: a.includeStackTraces ? s.stack : s.message };
      n.PhysicalResourceId ||
        (e.RequestType === "Create"
          ? (a.log(
              "CREATE failed, responding with a marker physical resource id so that the subsequent DELETE will be ignored",
            ),
            (n.PhysicalResourceId = p))
          : a.log(
              `ERROR: Malformed event. "PhysicalResourceId" is required: ${JSON.stringify(e)}`,
            )),
        await u("FAILED", n);
    }
  };
}
function k(t, e = {}) {
  let o = e.PhysicalResourceId ?? t.PhysicalResourceId ?? t.RequestId;
  if (t.RequestType === "Delete" && o !== t.PhysicalResourceId)
    throw new Error(
      `DELETE: cannot change the physical resource ID from "${t.PhysicalResourceId}" to "${e.PhysicalResourceId}" during deletion`,
    );
  return { ...t, ...e, PhysicalResourceId: o };
}
async function u(t, e) {
  let o = {
      Status: t,
      Reason: e.Reason ?? t,
      StackId: e.StackId,
      RequestId: e.RequestId,
      PhysicalResourceId: e.PhysicalResourceId || L,
      LogicalResourceId: e.LogicalResourceId,
      NoEcho: e.NoEcho,
      Data: e.Data,
    },
    r = m.parse(e.ResponseURL),
    s = `${r.protocol}//${r.hostname}/${r.pathname}?***`;
  a.log("submit response to cloudformation", s, o);
  let n = JSON.stringify(o),
    E = {
      hostname: r.hostname,
      path: r.path,
      method: "PUT",
      headers: {
        "content-type": "",
        "content-length": Buffer.byteLength(n, "utf8"),
      },
    };
  await O({ attempts: 5, sleep: 1e3 }, a.sendHttpRequest)(E, n);
}
async function D(t, e) {
  return new Promise((o, r) => {
    try {
      let s = y.request(t, (n) => {
        n.resume(),
          !n.statusCode || n.statusCode >= 400
            ? r(new Error(`Unsuccessful HTTP response: ${n.statusCode}`))
            : o();
      });
      s.on("error", r), s.write(e), s.end();
    } catch (s) {
      r(s);
    }
  });
}
function T(t, ...e) {
  console.log(t, ...e);
}
function O(t, e) {
  return async (...o) => {
    let r = t.attempts,
      s = t.sleep;
    for (;;)
      try {
        return await e(...o);
      } catch (n) {
        if (r-- <= 0) throw n;
        await b(Math.floor(Math.random() * s)), (s *= 2);
      }
  };
}
async function b(t) {
  return new Promise((e) => setTimeout(e, t));
}
var g = "aws-cdk:auto-delete-objects",
  x = JSON.stringify({ Version: "2012-10-17", Statement: [] }),
  c = new h.S3({}),
  H = R(S);
async function S(t) {
  switch (t.RequestType) {
    case "Create":
      return;
    case "Update":
      return { PhysicalResourceId: (await F(t)).PhysicalResourceId };
    case "Delete":
      return N(t.ResourceProperties?.BucketName);
  }
}
async function F(t) {
  let e = t,
    o = e.OldResourceProperties?.BucketName;
  return { PhysicalResourceId: e.ResourceProperties?.BucketName ?? o };
}
async function _(t) {
  try {
    let e = (await c.getBucketPolicy({ Bucket: t }))?.Policy ?? x,
      o = JSON.parse(e);
    o.Statement.push({
      Principal: "*",
      Effect: "Deny",
      Action: ["s3:PutObject"],
      Resource: [`arn:aws:s3:::${t}/*`],
    }),
      await c.putBucketPolicy({ Bucket: t, Policy: JSON.stringify(o) });
  } catch (e) {
    if (e.name === "NoSuchBucket") throw e;
    console.log(
      `Could not set new object deny policy on bucket '${t}' prior to deletion.`,
    );
  }
}
async function U(t) {
  let e;
  do {
    e = await c.listObjectVersions({ Bucket: t });
    let o = [...(e.Versions ?? []), ...(e.DeleteMarkers ?? [])];
    if (o.length === 0) return;
    let r = o.map((s) => ({ Key: s.Key, VersionId: s.VersionId }));
    await c.deleteObjects({ Bucket: t, Delete: { Objects: r } });
  } while (e?.IsTruncated);
}
async function N(t) {
  if (!t) throw new Error("No BucketName was provided.");
  try {
    if (!(await W(t))) {
      console.log(`Bucket does not have '${g}' tag, skipping cleaning.`);
      return;
    }
    await _(t), await U(t);
  } catch (e) {
    if (e.name === "NoSuchBucket") {
      console.log(`Bucket '${t}' does not exist.`);
      return;
    }
    throw e;
  }
}
async function W(t) {
  return (await c.getBucketTagging({ Bucket: t })).TagSet?.some(
    (o) => o.Key === g && o.Value === "true",
  );
}
