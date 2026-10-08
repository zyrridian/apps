package schema

#Platform: "android" | "web" | "linux" | "windows" | "macos"

#Artifact: {
    platform: #Platform
    type: "apk" | "aab" | "exe" | "appimage" | "zip" | "dmg"
    filename: string
    url: string
    sha256: string & =~"^[a-f0-9]{64}$"
    size: int & >=0
}

#Screenshot: {
    filename: string
    url: string
}

#App: {
    schema:      "v1"
    id:          string & =~"^[a-z0-9]+(?:-[a-z0-9]+)*$"
    name:        string & =~"^.{2,80}$"
    version:     string & =~"^[0-9]+\\.[0-9]+\\.[0-9]+$"

    description: string & =~"^.{10,500}$"

    category: string

    repository: string
    release:    string

    featured: bool
    icon?: string

    artifacts: [...#Artifact]
    screenshots: [...#Screenshot]
}

#Registry: {
    schema:      "v1"
    generatedAt: string
    apps:        [...#App]
}